import {
    appName,
    githubUrl,
    instagramUrl,
    linkedinUrl,
    websiteUrl,
} from "@/Constants/app";
import React from "react";

export default function FrontpageFooter() {
    return (
        <footer className="p-4 bg-white sm:p-6">
            <div className="max-w-screen-xl mx-auto">
                <div className="md:flex md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <a href="/" className="flex items-center">
                            <img
                                src="/assets/images/logo.png"
                                className="h-6 mr-3 sm:h-9 rounded-full"
                                alt="Logo"
                            />
                            <span className="self-center text-xl font-semibold whitespace-nowrap">
                                {appName}
                            </span>
                        </a>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">
                                Kontak Kami
                            </h2>
                            <ul className="text-gray-600">
                                <li className="mb-4">
                                    <a
                                        href="https://maps.app.goo.gl/TTxQXvyPhzdQU23C6"
                                        target="_blank"
                                        className="hover:underline"
                                    >
                                        Alamat: Muncan, Selat, Karangasem, Bali
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://wa.me/6283129743647"
                                        className="hover:underline"
                                    >
                                        Telepon/WA: 083129743647
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">
                                Ikuti Kami
                            </h2>
                            <ul className="text-gray-600">
                                <li className="mb-4">
                                    <a
                                        href={instagramUrl}
                                        target="_blank"
                                        className="hover:underline "
                                    >
                                        Instagram
                                    </a>
                                </li>
                                <li className="mb-4">
                                    <a
                                        href={linkedinUrl}
                                        target="_blank"
                                        className="hover:underline"
                                    >
                                        LinkedIn
                                    </a>
                                </li>
                                <li className="mb-4">
                                    <a
                                        href={githubUrl}
                                        target="_blank"
                                        className="hover:underline"
                                    >
                                        Github
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />
                <div className="sm:flex sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-500 sm:text-center">
                        ©{new Date().getFullYear()}{" "}
                        <a href={websiteUrl} className="hover:underline">
                            {appName}
                        </a>
                        . All Rights Reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
}
