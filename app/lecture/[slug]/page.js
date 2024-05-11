"use client"

import { AppContext } from "@/app/context/AppContext";
import { getChatCompletion } from "@/app/controller/dataFetch";
import MainLayout from "@/app/layouts/MainLayout";
import { CardContent, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";


export default function Page({params}) {

    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const {setContextPreviousMessage, contextPreviousMessage, setErrorMessage, setShowAlert, setTextButton, setShowFooterButton } = useContext(AppContext)

    const prompt = 
    {
        role: "user",
        content: `أشرح لي كطالب يتعلم اللغة الإنجليزية في مستوى A2 ماهو ${params.slug}`
    }

    const loadingTextArray = [
        "نحضر لك درسًا شيقًا",
        "قريبًا ستبدأ الدرس الممتع، استعد!",
        "درس شيق قيد الإعداد، يرجى الانتظار.",
        "جارٍ تحضير درس مثير، قليلًا من الصبر.",
        "استعد لدرس مميز، سيبدأ قريبًا.",
        "درس شيق قادم، استعد للاستفادة.",
        "نحن في طور إعداد درس مثير، انتظر لحظة."
    ]
    

    const getLecture = async () => {
        setShowFooterButton(false)
        setLoading(true)
        const response = await getChatCompletion(
            [
                prompt
            ]
        )
        checkResponse(response)
        setShowFooterButton(true)
        setTextButton('أشرح لي المزيد')
        setLoading(false)
    }

    const checkResponse = (response) => {
        if (response.status == 200) {
            setMessage(response.data.content)
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

    const getMoreData = async () => {
        setShowFooterButton(false)
        setLoading(true)
        const response = await getChatCompletion([
            ...contextPreviousMessage,
            {
                role: "user",
                content: `أشرح لي المزيد عن ${params.slug}`
            }
        ])
        checkResponse(response)
        setShowFooterButton(true)
        setLoading(false)
    }

    useEffect(() => {
        getLecture()
    }, [])

    return(
        <MainLayout loading={loading} onButtonClick={() => getMoreData()} loadingText={loadingTextArray[Math.floor(Math.random() * (loadingTextArray.length-1))]}>
            {message && <CardContent sx={{ mb: 12 }}>
                <Typography sx={{ mt: 6, fontSize: '16px', textAlign: 'left'}} variant="p" component="span">
                    {message.split(/\n/).map((line, index) => <p key={index}>{line}</p>)}
                </Typography>
            </CardContent>}
        </MainLayout>
    )
}