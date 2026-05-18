import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DynamicChart, ChartConfig } from './DynamicChart';

export function parseTextAndChart(text: string) {
    const chartRegex = /```chart\s*([\s\S]*?)```/;
    const match = text.match(chartRegex);
    let md = text;
    let chartConfig: ChartConfig | null = null;
    if (match && match[1]) {
        md = text.replace(match[0], ''); // strip the chart block from markdown
        let jsonStr = match[1].trim();
        const startIdx = jsonStr.indexOf('{');
        const endIdx = jsonStr.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
            jsonStr = jsonStr.substring(startIdx, endIdx + 1);
        }
        
        // Fix common LLM formatting errors
        jsonStr = jsonStr.replace(/}\s*{/g, '},{')
                         .replace(/]\s*\[/g, '],[')
                         .replace(/,\s*}/g, '}')
                         .replace(/,\s*]/g, ']');
                         
        try { 
            chartConfig = JSON.parse(jsonStr); 
        } catch(e) {
            console.error('Failed to parse Chart JSON', e);
        }
    }
    return { md, chartConfig };
}

interface MarkdownWithChartProps {
    text: string;
    onDrilldown?: (query: string) => void;
}

export function MarkdownWithChart({ text, onDrilldown }: MarkdownWithChartProps) {
    const { md, chartConfig } = parseTextAndChart(text);

    return (
        <div className={chartConfig ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "w-full"}>
            <div className="prose prose-sm xl:prose-base prose-indigo max-w-none text-gray-800 prose-headings:font-serif prose-headings:text-gray-900 prose-a:text-indigo-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
            </div>
            {chartConfig && (
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm h-auto min-h-[400px] flex flex-col items-center justify-center">
                    <DynamicChart config={chartConfig} onDrilldown={onDrilldown} />
                </div>
            )}
        </div>
    );
}
