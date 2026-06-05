import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import haruHeadpat from '/imgs/haruHeadpat.webp'

const NAV_LINKS = [
  { to: '/', label: 'Home page' },
]

{/*Sujet a modification ultérieur, placeholder potentiel mais ce serait drole de le regarder*/}
export default function Terms() {
  return (
    <>
      <Header title="STABLEMETRICS" />
      <Nav links={NAV_LINKS} />
      <main>
        <div className="important-terms" aria-hidden="true">
            <img src={haruHeadpat} alt="Haru Urara" className="important-terms-img" />
        </div>
      </main>

        <style>{`
            .important-terms {
                display: flex;
                justify-content: center;
                align-items: center;
            }
        `}
        </style>

      <Footer />
    </>
  )
}
