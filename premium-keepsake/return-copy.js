const rows={
en:['Your test keepsake order','Saved local order','Select your order','Card design','Check status','Download test card PNG','Download test PDF','Continue free','Contact support','Return to my keepsake'],
'zh-CN':['你的测试纪念包订单','本机保存的订单','请选择订单','卡片设计','重新检查订单','下载测试卡片 PNG','下载测试纪念册 PDF','继续免费游戏','联系客服','返回我的纪念包'],
'zh-TW':['你的測試紀念包訂單','本機儲存的訂單','請選擇訂單','卡片設計','重新檢查訂單','下載測試卡片 PNG','下載測試紀念冊 PDF','繼續免費遊戲','聯絡支援','返回我的紀念包'],
ja:['テスト記念パックの注文','この端末の注文','注文を選ぶ','カードのデザイン','注文を再確認','テストカードPNGを保存','テストPDFを保存','無料ゲームへ','サポート','自分の記念作品に戻る'],
ko:['테스트 기념품 주문','이 기기에 저장된 주문','주문 선택','카드 디자인','주문 다시 확인','테스트 카드 PNG 다운로드','테스트 PDF 다운로드','무료 게임 계속','지원 문의','내 기념품으로 돌아가기'],
es:['Tu pedido de prueba','Pedido local guardado','Selecciona tu pedido','Diseño de tarjeta','Comprobar pedido','Descargar tarjeta PNG de prueba','Descargar PDF de prueba','Seguir gratis','Contactar con soporte','Volver a mi recuerdo'],
'pt-BR':['Seu pedido de teste','Pedido local salvo','Selecione seu pedido','Design do cartão','Verificar pedido','Baixar cartão PNG de teste','Baixar PDF de teste','Continuar grátis','Falar com suporte','Voltar à minha lembrança'],
fr:['Votre commande test','Commande locale enregistrée','Choisir une commande','Style de carte','Vérifier la commande','Télécharger la carte PNG test','Télécharger le PDF test','Continuer gratuitement','Contacter le support','Revenir à mon souvenir'],
de:['Deine Testbestellung','Lokal gespeicherte Bestellung','Bestellung wählen','Kartendesign','Bestellung prüfen','Testkarte als PNG herunterladen','Test-PDF herunterladen','Kostenlos weiterspielen','Support kontaktieren','Zurück zu meiner Erinnerung']};
export const returnCopy=lang=>Object.fromEntries(['heading','saved','select','design','check','card','pdf','free','support','back'].map((k,i)=>[k,(rows[lang]||rows.en)[i]]));
export const localePrefix=lang=>({'zh-CN':'zh-cn/','zh-TW':'zh-tw/',ja:'ja/',ko:'ko/',es:'es/','pt-BR':'pt-br/',fr:'fr/',de:'de/'}[lang]||'');
