/* Calendar is presentation metadata, never a statistical observation year. */
(function(root){
 const valid=m=>typeof m==='string'&&/^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(m);
 const currentMonth=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
 function addYears(month,years){if(!valid(month)||!Number.isInteger(years))throw Error('Invalid calendar month');const year=Number(month.slice(0,4))+years;if(year<1000||year>9999)throw Error('Invalid calendar year');return `${year}-${month.slice(5)}`;}
 function at(life,age=0){return valid(life?.calendarMonth)?addYears(life.calendarMonth,age):String(Number(life?.year)+age);}
 const range=life=>`${at(life)}–${at(life,life.deathAge??life.age??0)}`;
 function date(life,age=0){const value={year:Number(life.year)+age};if(valid(life.calendarMonth))value.month=Number(life.calendarMonth.slice(5));return value;}
 function personDate(d){return d?.year?String(d.year)+(d.month?'-'+String(d.month).padStart(2,'0'):''):'';}
 root.CalendarCore={valid,currentMonth,addYears,at,range,date,personDate,pending:undefined,
  birthSpec(era){if(era==='past')return {year:1990};if(era==='future')return {year:2080};if(this.pending===null)return {year:2024};const month=valid(this.pending)?this.pending:currentMonth();return {year:Number(month.slice(0,4)),calendarMonth:month};}
 };
})(globalThis);
