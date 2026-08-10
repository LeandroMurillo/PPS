import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(currentDir, "../..");
const spSqlPath = resolve(root, "Codigo/DB/sp.sql");
const outputTsvPath = resolve(root, "Informe/listado_sp.tsv");

function splitTopLevel(text, separator = ",") {
	const parts = [];
	let start = 0;
	let depth = 0;
	let quote = null;

	for (let i = 0; i < text.length; i += 1) {
		const char = text[i];

		if (quote) {
			if (char === "\\") {
				i += 1;
				continue;
			}
			if (char === quote) quote = null;
			continue;
		}

		if (["'", '"', "`"].includes(char)) quote = char;
		else if (char === "(") depth += 1;
		else if (char === ")") depth = Math.max(0, depth - 1);
		else if (char === separator && depth === 0) {
			parts.push(text.slice(start, i).trim());
			start = i + 1;
		}
	}

	const last = text.slice(start).trim();
	if (last) parts.push(last);
	return parts;
}

function normalizeSpaces(text) {
	return text.replace(/\s+/g, " ").trim();
}

function unquoteIdentifier(identifier) {
	return identifier.trim().replace(/^`|`$/g, "");
}

function parseComment(routineSql) {
	const match = routineSql.match(/\bCOMMENT\s+'((?:\\'|''|[^'])*)'/is);
	if (!match) return ["Sin descripcion", ""];

	const comment = normalizeSpaces(match[1].replaceAll("\\'", "'").replaceAll("''", "'"));
	const parts = comment.split(/\bResultsets\s*:/i);
	if (parts.length === 1) {
		const [description] = comment.split(/\s+RS\d+\s*:/i);
		return [description.trim(), ""];
	}
	return [parts[0].trim(), parts.slice(1).join("Resultsets:").trim()];
}

function parseParameters(paramsSql) {
	const params = [];

	for (const rawParam of splitTopLevel(paramsSql)) {
		const param = normalizeSpaces(rawParam);
		const match = param.match(/^(IN|INOUT)\s+(`?[\w]+`?)\s+(.+)$/i);
		if (!match) continue;

		const name = unquoteIdentifier(match[2]);
		const dataType = match[3].split(/\s+DEFAULT\s+/i)[0].trim();
		params.push(`${name} ${dataType}`);
	}

	return params.length > 0 ? params.join(" | ") : "Sin parametros de entrada";
}

function updateParenthesisDepth(text, initialDepth) {
	let depth = initialDepth;
	let quote = null;

	for (let i = 0; i < text.length; i += 1) {
		const char = text[i];

		if (quote) {
			if (char === "\\") {
				i += 1;
				continue;
			}
			if (char === quote) quote = null;
			continue;
		}

		if (["'", '"', "`"].includes(char)) quote = char;
		else if (char === "(") depth += 1;
		else if (char === ")") depth = Math.max(0, depth - 1);
	}

	return depth;
}

function statementIsFinished(statement) {
	let depth = 0;
	let quote = null;

	for (let i = 0; i < statement.length; i += 1) {
		const char = statement[i];

		if (quote) {
			if (char === "\\") {
				i += 1;
				continue;
			}
			if (char === quote) quote = null;
			continue;
		}

		if (["'", '"', "`"].includes(char)) quote = char;
		else if (char === "(") depth += 1;
		else if (char === ")") depth = Math.max(0, depth - 1);
		else if (char === ";" && depth === 0) return true;
	}

	return false;
}

function extractSelectStatements(body) {
	const statements = [];
	let depth = 0;
	let current = null;
	let previousKeyword = "";

	for (const line of body.split(/\r?\n/)) {
		const stripped = line.trim();
		const upper = stripped.toUpperCase();

		if (current === null && depth === 0 && /^SELECT\b/.test(upper)) {
			if (!["INSERT", "CREATE"].includes(previousKeyword)) {
				current = [line];
				if (statementIsFinished(line)) {
					statements.push(current.join("\n"));
					current = null;
				}
			}
			depth = updateParenthesisDepth(line, depth);
		} else if (current !== null) {
			current.push(line);
			if (statementIsFinished(current.join("\n"))) {
				statements.push(current.join("\n"));
				current = null;
			}
			depth = updateParenthesisDepth(line, depth);
		} else {
			depth = updateParenthesisDepth(line, depth);
		}

		if (stripped && !stripped.startsWith("--")) {
			const firstWord = upper.match(/^([A-Z]+)\b/);
			if (firstWord) previousKeyword = firstWord[1];
		}
	}

	return statements;
}

function findTopLevelKeyword(sql, keyword) {
	let depth = 0;
	let quote = null;
	const upperKeyword = keyword.toUpperCase();

	for (let i = 0; i < sql.length; i += 1) {
		const char = sql[i];

		if (quote) {
			if (char === "\\") {
				i += 1;
				continue;
			}
			if (char === quote) quote = null;
			continue;
		}

		if (["'", '"', "`"].includes(char)) quote = char;
		else if (char === "(") depth += 1;
		else if (char === ")") depth = Math.max(0, depth - 1);
		else if (depth === 0 && sql.slice(i, i + keyword.length).toUpperCase() === upperKeyword) {
			const before = i > 0 ? sql[i - 1] : " ";
			const after = i + keyword.length < sql.length ? sql[i + keyword.length] : " ";
			if (!/[\w]/.test(before) && !/[\w]/.test(after)) return i;
		}
	}

	return -1;
}

function statementReturnsResultset(statement) {
	const compact = normalizeSpaces(statement);
	if (!/^SELECT\b/i.test(compact)) return false;

	const selectBody = compact.slice("SELECT".length).trim();
	const fromPos = findTopLevelKeyword(selectBody, "FROM");
	const intoPos = findTopLevelKeyword(selectBody, "INTO");
	return intoPos === -1 || (fromPos !== -1 && intoPos > fromPos);
}

function columnName(selectItem) {
	const item = normalizeSpaces(selectItem).replace(/;$/, "");

	const aliasMatch = item.match(/\bAS\s+(`?[\w]+`?)$/i);
	if (aliasMatch) return unquoteIdentifier(aliasMatch[1]);

	const qualifiedMatch = item.match(/\.(`?[\w]+`?)$/);
	if (qualifiedMatch) return unquoteIdentifier(qualifiedMatch[1]);

	const identifierMatch = item.match(/^`?([\w]+)`?$/);
	if (identifierMatch) return unquoteIdentifier(identifierMatch[1]);

	return item;
}

function inferResultsets(body) {
	const resultsets = [];

	for (const statement of extractSelectStatements(body)) {
		if (!statementReturnsResultset(statement)) continue;

		let selectBody = normalizeSpaces(statement).slice("SELECT".length).trim().replace(/;$/, "");
		selectBody = selectBody.replace(/^DISTINCT\s+/i, "");
		const fromPos = findTopLevelKeyword(selectBody, "FROM");
		const selectList = fromPos === -1 ? selectBody : selectBody.slice(0, fromPos).trim();
		const columns = splitTopLevel(selectList).map(columnName);
		resultsets.push(`RS${resultsets.length + 1}: (${columns.join(", ")})`);
	}

	return resultsets.length > 0 ? `${resultsets.join(". ")}.` : "";
}

function extractCallTargets(body) {
	return [...body.matchAll(/\bCALL\s+`?(?<name>[\w]+)`?\s*\(/gi)].map((match) => match.groups.name);
}

function findMatchingParenthesis(sql, openPos) {
	let depth = 0;
	let quote = null;

	for (let i = openPos; i < sql.length; i += 1) {
		const char = sql[i];

		if (quote) {
			if (char === "\\") {
				i += 1;
				continue;
			}
			if (char === quote) quote = null;
			continue;
		}

		if (["'", '"', "`"].includes(char)) quote = char;
		else if (char === "(") depth += 1;
		else if (char === ")") {
			depth -= 1;
			if (depth === 0) return i;
		}
	}

	throw new Error("No se encontro el parentesis de cierre de parametros");
}

function iterProcedures(sql) {
	const procedures = [];
	const createPattern = /CREATE\s+OR\s+REPLACE\s+PROCEDURE\s+`?(?<name>[\w]+)`?\s*\(/gi;

	for (const match of sql.matchAll(createPattern)) {
		const openPos = sql.indexOf("(", match.index);
		const closePos = findMatchingParenthesis(sql, openPos);
		const tail = sql.slice(closePos);
		const endMatch = tail.match(/\bEND\s*\/\//i);
		if (!endMatch) throw new Error(`No se encontro el cierre END // de ${match.groups.name}`);

		const endPos = closePos + endMatch.index + endMatch[0].length;
		const routineSql = sql.slice(match.index, endPos);
		const beginMatch = routineSql.match(/\bBEGIN\b/i);
		if (!beginMatch) throw new Error(`No se encontro BEGIN en ${match.groups.name}`);

		procedures.push({
			name: match.groups.name,
			params: sql.slice(openPos + 1, closePos),
			body: routineSql.slice(beginMatch.index + beginMatch[0].length, routineSql.length - endMatch[0].length),
			routineSql,
		});
	}

	return procedures;
}

function tsvCell(value) {
	return value.replace(/\r?\n/g, " ").replace(/\t/g, " ");
}

function main() {
	const sql = readFileSync(spSqlPath, "utf8");
	const procedures = iterProcedures(sql);
	const byName = new Map(procedures.map((procedure) => [procedure.name, procedure]));
	const comments = new Map(procedures.map((procedure) => [procedure.name, parseComment(procedure.routineSql)]));
	const directResultsets = new Map(procedures.map((procedure) => [procedure.name, inferResultsets(procedure.body)]));
	const calls = new Map(procedures.map((procedure) => [procedure.name, extractCallTargets(procedure.body)]));

	function resolveResultsets(name, seen = new Set()) {
		if (seen.has(name)) return "";
		seen.add(name);

		const [, resultsetsOverride] = comments.get(name);
		if (resultsetsOverride) return resultsetsOverride;

		const direct = directResultsets.get(name);
		if (direct) return direct;

		return calls
			.get(name)
			.filter((target) => byName.has(target))
			.map((target) => resolveResultsets(target, new Set(seen)))
			.filter(Boolean)
			.join(" ");
	}

	const rows = procedures
		.map((procedure) => {
			const [description] = comments.get(procedure.name);
			const resultsets = resolveResultsets(procedure.name);
			return {
				"stored procedure": procedure.name,
				descripcion: description,
				parametros_entrada: parseParameters(procedure.params),
				resultsets: resultsets || "Sin resultsets",
			};
		})
		.sort((left, right) => left["stored procedure"].localeCompare(right["stored procedure"]));

	const headers = ["stored procedure", "descripcion", "parametros_entrada", "resultsets"];
	const output = [
		headers.join("\t"),
		...rows.map((row) => headers.map((header) => tsvCell(row[header])).join("\t")),
	].join("\n");

	writeFileSync(outputTsvPath, `${output}\n`, "utf8");
}

main();
