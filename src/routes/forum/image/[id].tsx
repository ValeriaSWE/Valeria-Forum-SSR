import { createRouteData, useParams, useRouteData } from "solid-start";
import { GetImage } from "~/api/posts";

export function routeData() {
    const params = useParams();
    const imgsrs = createRouteData(async () => {
        const img = await GetImage(params.id)
        const imgData = (`data:image/png;base64,${btoa(new Uint8Array(img.data.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''))}`)

        return imgData
    })

    return imgsrs
}

export default function Image() {
    const src = useRouteData<typeof routeData>()

    return (
        <img src={src()} />
    )
}