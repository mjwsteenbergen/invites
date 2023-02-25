import { getData, invite, InviteDataResponse } from '@/api/laurentia';
import Head from 'next/head'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from './index.module.scss';

type NJSQuery = {
    id: string;
    name: string;
}

export default function Page() {
    const router = useRouter()
    const { id, name } = router.query as NJSQuery;
    const [data, setData] = useState<InviteDataResponse | undefined | null>(undefined);

    useEffect(() => {
        if (name && id) {            
            getData(name, id, window.localStorage.getItem("email") ?? "").then(i => {
                setData(i === undefined ? null : i)
            });
        }
    }, [name, id]);

    return (
        <>
            <Head>
                <title>Invites</title>
                <meta name="description" content={"You've been invited to " + name} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className={styles.page}>
                <main className={styles.main}>
                    {data ? <CalendarView evId={id} alias={name} {...data} /> : <div>
                        {data === null ? <><h1 className={styles.loadingheader}>Error</h1>
                            <p>Either the url you gave is wrong<br />Or Martijn broke something<br />Have you tried to refresh?</p></> :
                            <><h1 className={styles.loadingheader}>Loading data...</h1>
                            <p>If this takes too long, please refresh.<br /> If that doesn{"'"}t work, poke Martijn </p></>}
                    </div>}
                </main>
            </div>
        </>
    )
}


type InviteRoute = {
    alias: string;
    evId: string;
};

type CalendarViewProps = InviteDataResponse & InviteRoute

const CalendarView = ({ location, locationUrl, startDate, endDate, name, inviteState, alias, evId }: CalendarViewProps) => {
    
    return <> <section>
        <h1>{name}</h1>
        <div className='grid'>
            <div>⌚</div>
            <p>{startDate.toLocaleString("en-GB", {
                weekday: "long",
                day: "2-digit",
                month: "short",
                year: "numeric"
            })}<br />{startDate.toLocaleString("en-GB", {
                timeStyle:"short"
            })}-{endDate.toLocaleString("en-GB", {
                minute: "numeric",
                hour: 'numeric',
                timeZoneName: "short"
            })}</p>
            {location ? (<><div>🏡</div>
                <a href={"https://www.google.com/maps/search/" + location} target="_blank" rel="noreferrer" className={styles.car}>{location} </a></>) : <></>}
            {locationUrl ? <><div>🌍</div><a href={locationUrl} target="_blank" rel="noreferrer" className={styles.car}>{ locationUrl}</a></> : ""}
            
        </div>
    </section>
        <div className={styles.divider}></div>
        <div className={styles.form}>
            <FormView evId={evId} inviteState={inviteState} alias={alias} />
        </div>

    </>

}

type FormViewProps = Pick<InviteDataResponse, "inviteState"> & InviteRoute;
const FormView = ({ evId, alias, inviteState }: FormViewProps) => {
    const [email, setEmail] = useState<string | null>(window.localStorage.getItem("email"));
    if (inviteState === "invited") {
        return <h2 className={styles.loadingheader}>You{"'"}ve been invited!</h2>
    } else if (inviteState === 'confirming') {
        return <p className={styles.verify}>Hold on. <br /> I{"'"}m verifying {window.localStorage.getItem("email")}. <br/>to make sure my invites are not abused.</p>
    } else if (inviteState === 'not-invited') {
        return <form onSubmit={(ev) => {
            ev.preventDefault();
            if (email) {
                invite(alias, evId, email)
            }
        }}>
            <input type="email" name="email" placeholder='example@example.org' onChange={(ev)=> setEmail(ev.target.value)} value={email ?? ""} />
            <input type="submit" value="Send me a calendar invite" />
        </form>
    } else {
        console.error(inviteState)
        return <h2>Undefined state. Please let Martijn know</h2>
    }
}
