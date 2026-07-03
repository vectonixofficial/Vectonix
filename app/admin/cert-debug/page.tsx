"use client";
import { useEffect, useRef } from "react";

export default function CertDebug() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const outRef = useRef<HTMLPreElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = "/certificate-template.png";
        img.onload = () => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            const { data, width, height } = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);

            // We scan horizontal slices to find text rows.
            // For each y, count pixels that are "dark blue" or "dark green"
            const rows: Record<string, number[]> = { blue: [], green: [] };
            for (let y = 0; y < height; y++) {
                let blue = 0, green = 0;
                for (let x = 100; x < width - 100; x++) {
                    const i = (y * width + x) * 4;
                    const r = data[i], g = data[i + 1], b = data[i + 2];
                    // navy blue: low r, low-mid g, high b
                    if (r < 80 && g < 100 && b > 120 && b - r > 60) blue++;
                    // green: low r, high g, low b
                    if (r < 80 && g > 130 && b < 100 && g - r > 80) green++;
                }
                if (blue > 8) rows.blue.push(y);
                if (green > 8) rows.green.push(y);
            }

            // Cluster consecutive rows into bands
            function cluster(rows: number[]) {
                const bands: { start: number; end: number }[] = [];
                let start = rows[0], prev = rows[0];
                for (let i = 1; i < rows.length; i++) {
                    if (rows[i] - prev > 15) {
                        bands.push({ start, end: prev });
                        start = rows[i];
                    }
                    prev = rows[i];
                }
                if (rows.length) bands.push({ start, end: prev });
                return bands;
            }

            // For each band, find left/right extent
            function findExtent(yStart: number, yEnd: number, color: "blue" | "green") {
                let minX = 9999, maxX = 0;
                for (let y = yStart; y <= yEnd; y++) {
                    for (let x = 50; x < width - 50; x++) {
                        const i = (y * width + x) * 4;
                        const r = data[i], g = data[i + 1], b = data[i + 2];
                        const isBlue = r < 80 && g < 100 && b > 120 && b - r > 60;
                        const isGreen = r < 80 && g > 130 && b < 100 && g - r > 80;
                        if ((color === "blue" && isBlue) || (color === "green" && isGreen)) {
                            minX = Math.min(minX, x);
                            maxX = Math.max(maxX, x);
                        }
                    }
                }
                return { minX, maxX };
            }

            const blueBands = cluster(rows.blue);
            const greenBands = cluster(rows.green);

            const result = {
                imageSize: { width, height },
                blueBands: blueBands.map(b => {
                    const ext = findExtent(b.start, b.end, "blue");
                    return { ...b, height: b.end - b.start, ...ext, centerY: Math.round((b.start + b.end) / 2) };
                }),
                greenBands: greenBands.map(b => {
                    const ext = findExtent(b.start, b.end, "green");
                    return { ...b, height: b.end - b.start, ...ext, centerY: Math.round((b.start + b.end) / 2) };
                }),
            };

            if (outRef.current) outRef.current.textContent = JSON.stringify(result, null, 2);
        };
    }, []);

    return (
        <div className="p-6 font-mono space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">Certificate Template Pixel Analysis</h1>
            <pre ref={outRef} className="bg-slate-950 text-emerald-400 p-4 rounded-xl overflow-auto max-h-[600px] border border-slate-800 shadow-inner">
                Analysing pixels…
            </pre>
            <canvas ref={canvasRef} className="max-w-full h-auto border border-slate-200 rounded-xl mt-6 shadow-md bg-white" />
        </div>
    );
}
