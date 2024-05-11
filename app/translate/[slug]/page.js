"use client"

import { AppContext } from "@/app/context/AppContext";
import { getChatCompletion } from "@/app/controller/dataFetch";
import MainLayout from "@/app/layouts/MainLayout";
import { Box, Button, CardContent, CircularProgress, TextField, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";


export default function Page({params}) {

    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [value, setValue] = useState("")
    const [assitantAnswer, setAssitantAnswer] = useState("")
    const [translateLoading, setTranslateLoading] = useState(false)

    const {setContextPreviousMessage, contextPreviousMessage, setErrorMessage, setShowAlert, setTextButton, setShowFooterButton } = useContext(AppContext)

    const prompt = 
    {
        role: "user",
        content: `Give me a simple English sentence that contains the ${params.slug}`
    }

    const loadingTextArray = [
        "الصبر مفتاح الإتقان، انتظر قليلاً وستحصل على جملة لترجمتها.",
        "استمتع بلحظات الانتظار بتحديد معنى هذه الجملة!",
        "قريبًا ستحصل على جملة مثيرة للترجمة، استعد!",
        "الترجمة تحتاج إلى تركيز، انتظر لرؤية الجملة وترجمها بدقة.",
        "التفكير العميق يحتاج للوقت، لننتظر سويًا للحصول على جملة لترجمتها.",
        "الترجمة فن يتطلب صبرًا، سنقدم لك جملة لتحدي ترجمتها.",
        "المتعة في تحديد المعاني، انتظر لرؤية الجملة وبدأ الترجمة."
        ]

    const getSentence = async () => {
        setAssitantAnswer("")
        setShowFooterButton(false)
        setLoading(true)
        const response = await getChatCompletion(
            [
                prompt
            ]
        )
        checkResponse(response, "question")
        setShowFooterButton(true)
        setTextButton('أعطني جملة جديدة')
        setLoading(false)
    }

    const checkResponse = (response, messageType) => {
        if (response.status == 200) {
            if(messageType == "question") {
                setMessage(response.data.content)
            } else {
                setAssitantAnswer(response.data.content)
            }
            setContextPreviousMessage([
              prompt,
              {
                role: response.data.role,
                content: response.data.content
              }
            ])
          } else {
            setShowAlert(true)
            setErrorMessage(response.data.error)
          }
    }

    const getNewSentence  = async () => {
        setAssitantAnswer("")
        setShowFooterButton(false)
        setLoading(true)
        const response = await getChatCompletion([
            ...contextPreviousMessage,
            {
                role: "user",
                content: `أعطني جملة جديدة عن ${params.slug}`
            }
        ])
        checkResponse(response, "question")
        setShowFooterButton(true)
        setLoading(false)
    }

    const checkAnswer = async () => {
        setTranslateLoading(true)
        const response = await getChatCompletion(
            [
                ...contextPreviousMessage,
                {
                    role: "user",
                    content: `أنا أعمل على ترجمة الجملة التالية \n
                     ${message} \n
                      وكانت ترجمتي لها هي هذه الجملة \n
                       ${value} \n
                    فهل ترجمتي صحيحة للجملة، تأكد لي من الترجمة الصحيحة وأعطني خطئي في حال كان لدي خطأ`
                }
            ]
        )
        checkResponse(response, "answer")
        setValue("")
        setTranslateLoading(false)
    }

    useEffect(() => {
        getSentence()
    }, [])

    return(
        <MainLayout loading={loading} onButtonClick={() => getNewSentence()} loadingText={loadingTextArray[Math.floor(Math.random() * (loadingTextArray.length-1))]}>
            {message && <CardContent sx={{ mb: 12, textAlign: 'center' }}>
                <Typography component="p">ترجم هذه الجملة إلى اللغة العربية: </Typography>
                <Typography sx={{ mt: 6, fontSize: '16px', textAlign: 'left'}} variant="p" component="span">
                    {message}
                </Typography>
                <Box component="div" sx={{ mt: 5 }}>
                    <TextField placeholder="الترجمة" sx={{ padding: 1 }} value={value} onChange={e => setValue(e.target.value)} />
                    <Button variant="contained" sx={{ display: 'block', mt: 2, mx: 'auto'}} onClick={() => checkAnswer()}>تأكد من الترجمة</Button>
                </Box>
                <Box component="div" sx={{mt:2}}>
                    {translateLoading ? <CircularProgress /> : 
                        assitantAnswer && <Typography component="span">
                            {assitantAnswer}
                        </Typography>
                    }
                </Box>
            </CardContent>}
        </MainLayout>
    )
}