//app/api/logout/route.ts

import { NextResponse } from "next/server";

export async function POST() {
    
    // Clear the cookie
    const response = NextResponse.json({ message: "Logout successful" });
    response.cookies.set("token", " ", {
        httpOnly: true, 
        expires: new Date(0), //Expire now
        path: "/",

    });
    return response;
}