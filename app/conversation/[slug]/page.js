"use client"

import { AppContext } from "@/app/context/AppContext";
import { getChatCompletion, getTextCompletion, getTranscription } from "@/app/controller/dataFetch";
import MainLayout from "@/app/layouts/MainLayout";
import { Box, Button, CardContent, CircularProgress, IconButton, TextField, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import MicIcon from '@mui/icons-material/Mic';
import StopCircleIcon from '@mui/icons-material/StopCircle';

export default function Page({params}) {

    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [sentence, setSentence] = useState("")
    const [assitantAnswer, setAssitantAnswer] = useState("")
    const [transcriptionLoading, setTranscriptionLoading] = useState(false)

    const {setContextPreviousMessage, contextPreviousMessage, setErrorMessage, setShowAlert, setTextButton, setShowFooterButton } = useContext(AppContext)

    const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({ audio: true });

    const prompt = 
    {
        role: "user",
        content: `Give me a simple English sentence that contains the ${params.slug}`
    }

    const loadingTextArray = [
        "القراءة توسّع مفرداتك وتعزز قوة لغتك.",
        "كل جملة تعزز فهمك لبنية اللغة واستخدام الكلمات.",
        "من خلال القراءة، تصبح أكثر دقة في التعبير عن أفكارك.",
        "اكتشف معاني جديدة واستخدمها لتحسين تواصلك اللغوي.",
        "قراءة الجمل تساعدك في تطوير مهاراتك في القواعد اللغوية.",
        "استمتع بالتعرف على أساليب متنوعة للتعبير من خلال القراءة.",
        "كل جملة تمنحك نموًا في فهمك للغة واستخدامها بثقة."
        ]


    const getSentence = async () => {
        setAssitantAnswer("")
        clearBlobUrl()
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
                setContextPreviousMessage([
                    prompt,
                    {
                      role: response.data.role,
                      content: response.data.content
                    }
                  ])
            } else {
                setAssitantAnswer(response.data)
            }
          } else {
            setShowAlert(true)
            setErrorMessage(response.data.error)
          }
    }

    const getNewSentence  = async () => {
        setAssitantAnswer("")
        clearBlobUrl()
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

    const fetchText = async () => {
        try {
            setTranscriptionLoading(true)
            const response = await getTranscription(mediaBlobUrl)
            setSentence(response.data.text)
            getConfirmSentence(response.data.text);
        } catch (error) {
            console.error(error);
        }
    }


    const getConfirmSentence = async (confirmSentence) => {
        const response = await getTextCompletion(` أكمل لي النص التالي والذي يحاول المستخدم من خلاله التأكد من أن جمله متطابقة مع الحاسوب
        Computer: I study English every day to improve my language skills
        User: I study English every day to improve my language skills
        Assistent: جملة متطابقة تمامًا، أحسنت
        Computer: The sun rises in the east and sets in the west
        User: The sun rise in the east and set in the west
        Assistent: هنالك خطأ في الجملة حيث أنك لم تلفظ الحرف s في كلمة rises و كلمة sets
        Computer: Water boils at 100 degrees Celsius
        User: vater bols at 100 degrees Clsius
        Assistent: لديك خطأ في لفظ Water و boils و Celsius
        Computer: ${message}
        User: ${confirmSentence}
        Assistent:`)
        checkResponse(response, "answer")
        setTranscriptionLoading(false)
    }

    useEffect(() => {
        getSentence()
    }, [])

    return(
        <MainLayout loading={loading} onButtonClick={() => getNewSentence()} loadingText={loadingTextArray[Math.floor(Math.random() * (loadingTextArray.length-1))]}>
            {message && <CardContent sx={{ mb: 12, textAlign: 'center' }}>
                <Typography component="p">حاول قراءة هذه الجملة: </Typography>
                <Typography sx={{ mt: 6, fontSize: '16px', textAlign: 'left'}} variant="p" component="span">
                    {message}
                </Typography>
                <Box component="div" sx={{ mt: 5 }}>
                    {
                        status == "recording" ?
                        <IconButton onClick={() => stopRecording()}>
                            <StopCircleIcon />
                        </IconButton>
                        :
                        <IconButton onClick={() => startRecording()}>
                            <MicIcon />
                        </IconButton>
                    }
                </Box>
                {mediaBlobUrl &&
                    <Box component="div" sx={{ mt: 10 }}>
                        <audio src={mediaBlobUrl} controls />
                        <Box component="div" sx={{ mt: 2 }}>
                            {
                                transcriptionLoading ?
                                <Button variant="outlined" sx={{ mt: 2 }}>
                                    <CircularProgress size="1rem" />
                                </Button>
                                :
                                <Button variant="outlined" sx={{ mt: 2 }} onClick={() => fetchText()}>
                                    تأكد من الجملة
                                </Button>
                            }
                        </Box>
                    </Box>
                }
                {
                    assitantAnswer &&
                    <Box component="div" sx={{ mt: 5 }}>
                        <Typography component="p">{assitantAnswer}</Typography>
                        <Typography component="p">الجملة التي ذكرتها</Typography>
                        <Typography component="p">{sentence}</Typography>
                    </Box>
                }
            </CardContent>}
        </MainLayout>
    )
}