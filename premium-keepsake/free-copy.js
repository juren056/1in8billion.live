// Public keepsakes are free; creator support remains an independent voluntary payment.
const rows={
 en:['Free keepsake','Save this life for free','Free · No payment required','Download PNG','Download PDF','Six designs, HD images and a printable storybook. Download directly, without payment.','Files are created in this browser. Save them to your device before clearing site data.'],
 'zh-CN':['免费人生纪念包','免费收藏这段人生','免费 · 无需付款','免费下载 PNG','免费下载 PDF','六种设计、高清图片与可打印纪念册，直接下载，无需付款。','文件在当前浏览器中生成。清除网站数据前，请先保存到设备。'],
 'zh-TW':['免費人生紀念包','免費收藏這段人生','免費 · 無需付款','免費下載 PNG','免費下載 PDF','六種設計、高畫質圖片與可列印紀念冊，直接下載，無需付款。','檔案在目前瀏覽器中產生。清除網站資料前，請先儲存到裝置。'],
 ja:['無料の人生記念パック','この人生を無料で保存','無料・支払い不要','PNGを無料保存','PDFを無料保存','6種類のデザイン、高解像度画像と印刷用冊子。支払いなしで保存できます。','ファイルはこのブラウザで作成します。サイトデータを消す前に端末へ保存してください。'],
 ko:['무료 인생 기념품','이 삶을 무료로 간직하기','무료 · 결제 불필요','PNG 무료 다운로드','PDF 무료 다운로드','여섯 디자인, 고해상도 이미지와 인쇄용 책자를 결제 없이 다운로드하세요.','파일은 이 브라우저에서 생성됩니다. 사이트 데이터를 지우기 전에 기기에 저장하세요.'],
 es:['Recuerdo de vida gratis','Guardar esta vida gratis','Gratis · Sin pago','Descargar PNG gratis','Descargar PDF gratis','Seis diseños, imágenes HD y un libro imprimible. Descarga directa, sin pago.','Los archivos se crean en este navegador. Guárdalos en tu dispositivo antes de borrar los datos.'],
 'pt-BR':['Lembranças da vida grátis','Guardar esta vida grátis','Grátis · Sem pagamento','Baixar PNG grátis','Baixar PDF grátis','Seis designs, imagens HD e um livro para imprimir. Baixe diretamente, sem pagar.','Os arquivos são criados neste navegador. Salve no dispositivo antes de apagar os dados.'],
 fr:['Souvenirs de vie gratuits','Conserver cette vie gratuitement','Gratuit · Aucun paiement','Télécharger le PNG gratuit','Télécharger le PDF gratuit','Six créations, images HD et livre imprimable. Téléchargement direct, sans paiement.','Les fichiers sont créés dans ce navigateur. Enregistrez-les avant d’effacer les données du site.'],
 de:['Kostenloses Lebensandenken','Dieses Leben kostenlos speichern','Kostenlos · Keine Zahlung','PNG kostenlos laden','PDF kostenlos laden','Sechs Designs, HD-Bilder und ein druckbares Buch. Direkt herunterladen, ohne Zahlung.','Dateien entstehen in diesem Browser. Vor dem Löschen der Websitedaten auf dem Gerät speichern.'],
 ru:['Бесплатные воспоминания о жизни','Сохранить эту жизнь бесплатно','Бесплатно · Без оплаты','Скачать PNG бесплатно','Скачать PDF бесплатно','Шесть дизайнов, изображения HD и книга для печати. Скачивание без оплаты.','Файлы создаются в этом браузере. Сохраните их на устройстве перед удалением данных сайта.']
};
export const freeCopy=(lang='en')=>Object.fromEntries(['title','save','free','png','pdf','detail','local'].map((key,i)=>[key,(rows[lang]||rows.en)[i]]));
