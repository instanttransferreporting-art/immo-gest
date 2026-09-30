import { NextResponse } from "next/server";

export function buildFileResponse(buffer: Buffer, filename: string, contentType: string): NextResponse {
    return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": String(buffer.length),
        },
    });
}
