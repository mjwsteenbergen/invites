import { getData, invite, InviteDataResponse } from '@/api/laurentia';
import Head from 'next/head'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from './index.module.scss';

const Example: InviteDataResponse = {
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now()),
    inviteState: "not-invited",
    location: "no-where",
    locationUrl: "https://nntn.nl/",
    name: "Cursed Christmas Dinner"

}

type NJSQuery = {
    id: string;
    name: string;
}

export default function Page() {
    const router = useRouter()
    const { id, name } = router.query as NJSQuery;
    const [data, setData] = useState<InviteDataResponse | undefined>(undefined);

    useEffect(() => {
        if (name && id) {            
            getData(name, id).then(i => {
                setData(i)
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
                        <h1 className={styles.loadingheader}>Loading data...</h1>
                        <p>If this takes too long, please refresh.<br /> If that doesn{"'"}t work, poke Martijn</p>
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

const CalendarView = ({ location, locationUrl, startDate, name, inviteState, alias, evId }: CalendarViewProps) => {
    
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
            })}-{startDate.toLocaleString("en-GB", {
                minute: "numeric",
                hour: 'numeric',
                timeZoneName: "short"
            })}</p>
            {location ? (<><div>🏡</div>
                <p>{location} {locationUrl ? <a href="https://nntn.nl/" target="_blank" rel="noreferrer" className={styles.car}>🚗</a> : ""}</p></>) : <></>}
            
        </div>
    </section>
        <div className={styles.divider}></div>
        <div className={styles.form}>
            <FormView evId={evId} inviteState={inviteState} alias={alias} />
        </div>

    </>

}

type FormViewProps = Pick<InviteDataResponse, "inviteState"> & InviteRoute;
const FormView = ({ evId, alias , inviteState }: FormViewProps) => {
    const [email, setEmail] = useState<string | undefined>(undefined);
    if (inviteState === "invited") {
        return <h2 className={styles.loadingheader}>You{"'"}ve been invited!</h2>
    } else if (inviteState === 'confirming') {
        return <p className={styles.verify}>To make sure my invites are not abused I need to verify everything. <br/>Please hold on</p>
    } else if (inviteState === 'not-invited') {
        return <form onSubmit={(ev) => {
            ev.preventDefault();
            if (email) {
                invite(alias, evId, email)
            }
        }}>
            <input type="email" name="email" placeholder='example@example.org' onChange={(ev)=> setEmail(ev.target.value)} />
            <input type="submit" value="Send me a calendar invite" />
        </form>
    } else {
        console.error(inviteState)
        return <h2>Undefined state. Please let Martijn know</h2>
    }
}
