import { FileRoutes, Navigate, Route, Routes } from "solid-start";

export default function RedirectFeed() {
    return (
        <Navigate href="feed" />
        // <Routes>
        //     <Route path="/" element={<Navigate href="feed" />}/>
        //     <FileRoutes />
        // </Routes>
    )
}
