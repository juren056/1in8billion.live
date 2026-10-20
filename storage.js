// Keep the original storage key and record shape so existing browser saves remain readable.
function saveCurrentLife(){try{if(STATE.life)localStorage.setItem(STORAGE_KEY+':current',JSON.stringify({version:1,life:STATE.life,era:STATE.era,birthMode:STATE.birthMode}));}catch{}}
