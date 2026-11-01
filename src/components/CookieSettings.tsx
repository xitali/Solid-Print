'use client'
import { useState } from 'react'
import { Modal } from './Modal'
export function CookieSettings(){const [open,setOpen]=useState(false);return <><button className="text-button" onClick={()=>setOpen(true)}>Ustawienia cookies</button>{open&&<Modal label="Twoja prywatność" onClose={()=>setOpen(false)}><section className="settings-dialog"><h2>Twoja prywatność</h2><p>Ta wersja strony nie korzysta z reklamowych ani analitycznych plików cookies. Panel właściciela używa niezbędnego pliku do logowania.</p><p>Modele w podglądzie są przetwarzane na Twoim urządzeniu. Wysyłamy je do pracowni dopiero po wybraniu „Wyślij zapytanie”.</p><a href="/cookies">Informacje o cookies</a><button className="button" autoFocus onClick={()=>setOpen(false)}>Zamknij</button></section></Modal>}</>}
