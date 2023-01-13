const TheArtStoreGallery_Head = ({params})=> {
    return (
        <>
            <title>The Art Store Gallery</title>
            <meta name="description"
                content="
	                    A simple Art Store Gallery where you can share your creations.
	                    Designed & Developed by: Christian Arvin C. Cabo
	                    email: cacc.greenleaflabworks@gmail.com"/>
            <meta charset="utf-8"/>
            {/* {<!-- bootstrap required meta-tags-->} */}
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
            {/* <!-- resolve cloudinary --> */}
            <link rel="dns-prefetch" href="https://cloudinary.com"/>
            {/* <!-- bootstrap css --> */}
            <link
                as="text/css"
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
                rel="stylesheet"
                precedence="default"
                integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65"
                crossorigin="anonymous"
            />
            <link 
                as="text/css"
                rel="stylesheet"
                precedence="default"
                href="https://cdn.jsdelivr.net/npm/fork-awesome@1.2.0/css/fork-awesome.min.css"
                integrity="sha256-XoaMnoYC5TH6/+ihMEnospgm0J1PM/nioxbOUdnM8HY="
                crossorigin="anonymous"
            />
        </>
    )
}

export default TheArtStoreGallery_Head