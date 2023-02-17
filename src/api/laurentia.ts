const baseUrl = "https://zeus-laurentia.azurewebsites.net"
// const baseUrl = "http://localhost:7071"
export const url = baseUrl + "/api/run/invite-data";

const headers = {
    "Authorization": "ad519d3b-1e16-427c-b5cb-2238f6dbd7ee"
}

type Request = DataRequest | InviteRequest;


type BaseRequest = {
    id: string;
    name: string;
}

type DataRequest = {
    mode: "get"
} & BaseRequest;

type InviteRequest = {
    mode: "invite";
    email: string;
} & BaseRequest;

export type InviteDataResponse = {
    name: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    locationUrl?: string;
    inviteState: "invited" | "confirming" | "not-invited";
}

const makeRequest = async (req: Request): Promise<any> => {
    return await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(req)
    }).then(i => i.json())
        .catch(i => {
            console.error(i);
            return undefined;
        })
    .then(i => i.Reply.Result)
}

export const getData = (name: string, id: string): Promise<InviteDataResponse> => makeRequest({
    id,
    name,
    mode: 'get'
}).then(i => {
    return {
        ...i,
        startDate: new Date(Date.parse(i.startdate)),
        endDate: new Date(Date.parse(i.enddate)),
        inviteState: i.invitestate
    }
});

export const invite = (name: string, id: string, email: string): Promise<InviteDataResponse> => makeRequest({
    id,
    name,
    email,
    mode: 'invite'
});