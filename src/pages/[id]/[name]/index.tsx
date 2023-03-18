import { getData, invite, InviteDataResponse } from '@/api/laurentia';
import Head from 'next/head'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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
            <div className='w-screen h-screen flex justify-center items-center'>
                <main className='flex gap-24 max-lg:flex-col ml-6 mr-6'>
                    {data ? <CalendarView evId={id} alias={name} {...data} /> : <div>
                        {data === null ? <><h1 >Error</h1>
                            <p>Either the url you gave is wrong<br />Or Martijn broke something<br />Have you tried to refresh?</p></> :
                            <><h1 >Loading data...</h1>
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
    
    return <> <section className='mt-4 mb-4'>
        <h1 className='text-4xl xl:text-6xl'>{name}</h1>
        <div className='grid grid-cols-[auto_1fr] gap-x-2'>
            <p className='xl:text-xl'>⌚</p>
            <p className='xl:text-xl'>{startDate.toLocaleString("en-GB", {
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
            {location ? (<><p className='xl:text-xl'>🏡</p>
                <p className='xl:text-xl'><a href={"https://www.google.com/maps/search/" + location} className="reset" target="_blank" rel="noreferrer" >{location} </a></p></>) : <></>}
            {locationUrl ? <><p className='xl:text-xl'>🌍</p><p className='xl:text-xl'><a href={locationUrl} target="_blank" className="reset" rel="noreferrer" >{locationUrl}</a></p></> : ""}
            
        </div>
    </section>
        <div className='w-px bg-gray-500 self-stretch max-lg:w-full max-lg:h-[1px]'></div>
        <FormView evId={evId} inviteState={inviteState} alias={alias} />
    </>

}

type FormViewProps = Pick<InviteDataResponse, "inviteState"> & InviteRoute;
const FormView = ({ evId, alias, inviteState }: FormViewProps) => {
    const [email, setEmail] = useState<string | null>(window.localStorage.getItem("email"));
    if (inviteState === "invited") {
        return <h2 className='self-center' >You{"'"}ve been invited!</h2>
    } else if (inviteState === 'confirming') {
        return <p className='self-center text-center'>I{"'"}m verifying {window.localStorage.getItem("email")} <br />to make sure my invites are not abused. <br/> Incorrect email? <b className='cursor-pointer' onClick={() => { window.localStorage.removeItem("email"); window.location.reload()}}>Change it</b></p>
    } else if (inviteState === 'not-invited') {
        return <form onSubmit={(ev) => {
            ev.preventDefault();
            if (email) {
                invite(alias, evId, email).then(() => {
                    window.location.reload();
                });
            }
        }} className='flex flex-col items-end justify-center'>
            <input type="email" name="email" className='xl:text-xl text-center pl-4 pr-4 pt-1 pb-1  min-w-[30ch] max-sm:min-w-full' placeholder='example@example.org' onChange={(ev) => setEmail(ev.target.value)} value={email ?? ""} />
            <input type="submit" className='mt-6 text-sm xl:text-md' value="Send me a calendar invite" />
        </form>
    } else {
        console.error(inviteState)
        return <h2>Undefined state. Please let Martijn know</h2>
    }
}
