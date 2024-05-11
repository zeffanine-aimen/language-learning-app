import { NextResponse } from 'next/server'
 


export async function POST(request) {

    const req = await request.json();

    const options = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: "user",
                    content: req.message
                }
            ]
        })
    }
 
    const response = await fetch("https://api.openai.com/v1/chat/completions", options)
    const data =await response.json()
 
  return NextResponse.json(data)
}