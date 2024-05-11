import { Typography, Box } from "@mui/material";
import logo from '../../../public/logo.png'
import Image from "next/image";
import styles from './SideBar.module.css'



export default function MenuFooter() {

    const date = new Date();

    return(
        <Box component="footer" className={styles.menufooter}>
            <Typography component="span">يستعمل تقنية OpenAI</Typography>
            <Typography component="p">جميع الحقوق محفوظة © <Typography component="span">{date.getFullYear()}</Typography></Typography>
            <Image src={logo} width={150} alt="brand" />
        </Box>
    )
}