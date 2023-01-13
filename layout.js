'use client'
import Script from "next/script"
const TheArtStoreGallery_RootLayout = ({children}) => {
    return (
        <>
            <section>
            </section>
            <nav>
                {/* Navar */}
                {/* Navigation */}
            </nav>
            {children}
            <Script
                strategy="lazyload"
                as="text/javascript"
                src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"
                integrity="sha384-oBqDVmMz9ATKxIep9tiCxS/Z9fNfEXiDAYTujMAeBAsjFuCZSmKbSSUnQlmh/jp3"
                crossorigin="anonymous"
            />
            <Script
                strategy="lazyload"
                as="text/javascript"
                src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js"
                integrity="sha384-cuYeSxntonz0PPNlHhBs68uyIAVpIIOZZ5JqeqvYYIcEL727kskC66kF92t6Xl2V"
                crossorigin="anonymous"
            />
        </>
    )
}

export default TheArtStoreGallery_RootLayout