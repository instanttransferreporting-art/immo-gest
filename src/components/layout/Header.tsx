"use client";

import { Breadcrumb } from "./Breadcrumb";
import { SearchBar } from "./SearchBar";
import { NotificationButton } from "./NotificationButton";
import { MobileSidebar } from "./MobileSidebar";
import { UserMenu } from "./UserMenu";

export function Header() {

    return (

        <header
            className="
            sticky
            top-0
            z-30
            flex
            h-20
            items-center
            justify-between
            gap-4
            border-b
            border-slate-200
            bg-white/90
            px-6
            backdrop-blur
        "
        >

            <div className="flex items-center gap-3">
                <MobileSidebar />
                <Breadcrumb />
            </div>

            <div className="flex flex-1 items-center justify-end gap-4">

                <SearchBar />

                <NotificationButton count={3} />

                <UserMenu />

            </div>

        </header>

    );

}
