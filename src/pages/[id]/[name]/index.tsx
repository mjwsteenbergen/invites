import { getData, invite, InviteDataResponse } from '@/api/laurentia';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import Head from 'next/head'
import { useRouter } from 'next/router';
import { useState } from 'react';

type NJSQuery = {
    id: string;
    name: string;
}

export default function Page() {
    const queryClient = new QueryClient();
    const router = useRouter();
    const { id, name } = router.query as NJSQuery;
    return <QueryClientProvider client={queryClient}>
        <>
            <Head>
                <title>Invites</title>
                <meta name="description" content={"You've been invited to an event"} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className='flex flex-col min-h-screen justify-items-center items-center justify-center m-5 py-8 '>
                <PageApp />
            </main>
        </>
    </QueryClientProvider>

}

const PageApp = () => {
    const router = useRouter();
    const { id, name } = router.query as NJSQuery;
    const { isLoading, data } = useQuery({
        queryKey: ["event", id, name],
        queryFn: () => {
            if (name && id) {
                return getData(name, id, window.localStorage.getItem("email") ?? "")
            }
            console.error("No name or id", router)
            throw Error();
        },

        staleTime: Number.MAX_VALUE,
    })

    if (isLoading) {
        return <><h1 >Loading data...</h1>
            <p>If this takes too long, please refresh.<br /> If that doesn{"'"}t work, poke Martijn </p></>
    }


    if (data === null || data === undefined) {
        return <><h1 >Error</h1>
            <p>Either the url you gave is wrong<br />Or Martijn broke something<br />Have you tried to refresh?</p></>
    }
    return (
        <>
            <div>
                <h1 className='self-start'><span className='text-5xl'>{data.name}</span></h1>
                <div className='grid gap-x-10 xl:grid-flow-col justify-start'>
                    <CalendarView {...data} />
                    <div className='w-px bg-gray-500 self-stretch max-lg:h-[1px]'></div>
                    <FormView inviteState={data.inviteState} />
                </div>
            </div>
        </>
    )
}

type FormViewProps = Pick<InviteDataResponse, "inviteState">;
const FormView = ({ inviteState }: FormViewProps) => {
    const [email, setEmail] = useState<string | null>(window.localStorage.getItem("email"));
    const router = useRouter();
    const { id, name } = router.query as NJSQuery;

    const content = () => {
        if (inviteState === "invited") {
            return <p className='self-center' >You{"'"}ve been invited!</p>
        } else if (inviteState === 'confirming') {
            return <p className='self-center text-center'>I{"'"}m verifying {window.localStorage.getItem("email")} <br />to make sure my invites are not abused. <br /> Incorrect email? <b className='cursor-pointer' onClick={() => { window.localStorage.removeItem("email"); window.location.reload() }}>Change it</b></p>
        } else if (inviteState === 'not-invited') {
            return <form onSubmit={(ev) => {
                ev.preventDefault();
                if (email) {
                    invite(name, id, email).then(() => {
                        window.location.reload();
                    });
                }
            }} className='flex flex-col items-start justify-center'>
                <input type="email" name="email" className='xl:text-xl text-center pl-4 pr-4 pt-1 pb-1  min-w-[30ch] max-sm:min-w-full' placeholder='example@example.org' onChange={(ev) => setEmail(ev.target.value)} value={email ?? ""} />
                <input type="submit" className='mt-6 text-sm xl:text-md' value="Send me a calendar invite" />
            </form>
        } else {
            console.error(inviteState)
            return <p className='text-red-400'>Undefined state. Please let Martijn know</p>
        }
    }

    return <section className='w-full'>
        <h2>Sign me up!</h2>
        {content()}
    </section>


}

const CalendarView = ({ name, startDate, endDate, body, location, locationUrl }: InviteDataResponse) => {
    return <section>

        <div data-type="table" className='grid grid-cols-[auto_1fr] gap-x-2'>
            <p>🕰️</p><Date start={startDate} end={endDate} />
            <LocationUrl url={locationUrl} />
            <LocationPlace place={location} />
        </div>
        {body && <>
            <h2>More info</h2>
            <div className='break-all' dangerouslySetInnerHTML={{ __html: body }}></div>
        </>}
    </section>
}

const LocationUrl = ({ url }: { url?: string }) => {
    if (url) {
        return <><p>🌎</p><p><a href={url} target='_blank' rel="noreferrer">Online</a></p></>
    }
    return null;
}

const LocationPlace = ({ place }: { place?: string }) => {
    if (place) {
        return <><p>🏡</p>
            <a href={"https://www.google.com/maps/search/" + place} className="reset" target="_blank" rel="noreferrer" >{place} </a></>
    }
    return null;
}

const Date = ({ start, end }: { start: Date, end: Date }) => {
    return <p>{start.toLocaleString("en-GB", {
        timeStyle: "short"
    })}-{end.toLocaleString("en-GB", {
        minute: "numeric",
        hour: 'numeric',
        timeZoneName: "short"
    })}<br />{start.toLocaleString("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric"
    })}</p>
}