import Link from 'next/link'
import landingCSS from './landing.module.css'

const TheArtStoreGallery_Landing = ()=> {
    
    return (
        <section className={landingCSS.landing_container}>
            <div className={landingCSS.landing_header}>
                <div>
                        <h1 className={landingCSS.landing_header_h1}>
                            Welcome to Art Store Gallery!
                        </h1>
                </div>
                <div>
                    <Link
                        href="/projects/theartstoregallery/gallery"
                        className="btn btn-lg btn-success"
                    >
                        View all <i className="fa fa-paint-brush" aria-hidden="true"/> Art's
                    </Link>
                </div>
            </div>

            <ul id="slideshow">
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </section>
    )
}

export default TheArtStoreGallery_Landing