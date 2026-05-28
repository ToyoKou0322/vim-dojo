import { NextRequest } from "next/server";

const COMPILER: Record<string, string> = {
  python: "cpython-3.12.7",
  cpp: "gcc-head",
};

export async function POST(request: NextRequest) {
  const { language, code, stdin } = await request.json() as {
    language: string;
    code: string;
    stdin: string;
  };

  const compiler = COMPILER[language];
  if (!compiler) {
    return Response.json({ error: `Unsupported language: ${language}` }, { status: 400 });
  }

  const res = await fetch("https://wandbox.org/api/compile.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ compiler, code, stdin }),
  });

  if (!res.ok) {
    return Response.json({ error: `Wandbox error: HTTP ${res.status}` }, { status: 502 });
  }

  const data = await res.json() as {
    status: string;
    program_output: string;
    program_error: string;
    compiler_error: string;
  };

  const stderr = [data.compiler_error, data.program_error].filter(Boolean).join("\n");

  return Response.json({
    run: {
      stdout: data.program_output ?? "",
      stderr,
      code: parseInt(data.status, 10) || 0,
    },
  });
}
