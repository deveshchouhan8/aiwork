import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request:Request) {    
    try{
        const body= await request.json();
        console.log(body);
        const messages = body.messages;
        //const messages = body?.messages;
        const input = Array.isArray(messages) ? messages : typeof body?.messages === "string" ? [{ role: "user", content: body.messages }] : null;
      if (!input || input.length === 0 || !input.every((item: { role?: string; content?: string }) => ["user", "assistant"].includes(item.role ?? "") && typeof item.content === "string" && item.content.trim().length > 0 )) {
        return NextResponse.json(
            { error: "A valid conversation is required." },
            { status: 400 }
        );
        }
      

        /* api call */      
        // const apiKey = process.env.OPENAI_API_KEY;  
        // if (!apiKey) {
        //     return NextResponse.json(
        //         {error: "Gemini API key is not configured." },
        //         {status: 500 }
        //     );
        // }
        // const openai  = new OpenAI({ apiKey });       
        // const response = await openai.responses.create({        
        //     model: "gpt-4.1-mini",       
        //     input: input.map((item: {role: string; content:string})=>({
        //         role:item.role as "user" | "assistant",
        //         content: item.content,

        //     }))
        // });
        // return NextResponse.json({
        //  reply: response.output_text  || "No text response was returned.",
        // });
        /* openAI api call end */

            
         /* for testing reply */
        const reply = `you asked: ${input.map((item) => item.content).join(" ")}. this is demo response. `; 
        return NextResponse.json({ reply });
       /* for testing reply */
     
    }
    catch{
        return NextResponse.json(
            {error:"Message is required."},
            {status: 400}
        );
    } 
}
