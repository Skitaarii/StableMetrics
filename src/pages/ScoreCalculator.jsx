import { useState } from 'react'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const NAV_LINKS = [{ to: '/', label: 'Home page' }]


export default function ScoreCalculator() {

  return (
  <>
        <header>
          <h1 className="small_title">SCORE CALCULATOR</h1>
        </header>
        <Nav links={NAV_LINKS} />
        <main>
          <section>
            <h2>Nothing here for now</h2>
          </section>
        </main>
        <Footer />
      </>
    )
}
