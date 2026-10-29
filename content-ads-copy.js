const rows={
 en:['Advertisement','Advertising choice','With your permission, Google may use cookies and device information for non-personalized advertising, measurement and fraud prevention.','Allow advertising','No thanks','Advertising preferences','Withdraw advertising permission','Privacy policy'],
 'zh-CN':['广告','广告偏好','经你允许，Google 可使用 Cookie 和设备信息投放非个性化广告、衡量效果及防范欺诈。','允许广告','暂不允许','广告偏好设置','撤回广告许可','隐私政策'],
 'zh-TW':['廣告','廣告偏好','經你允許，Google 可使用 Cookie 和裝置資訊投放非個人化廣告、衡量成效及防範詐欺。','允許廣告','暫不允許','廣告偏好設定','撤回廣告許可','隱私政策'],
 ja:['広告','広告の設定','同意した場合、Google は Cookie と端末情報を使用し、非パーソナライズ広告の配信、測定、不正防止を行うことがあります。','広告を許可','許可しない','広告の設定','広告への同意を撤回','プライバシーポリシー'],
 ko:['광고','광고 설정','동의하면 Google은 쿠키와 기기 정보를 비개인 맞춤 광고, 측정 및 사기 방지에 사용할 수 있습니다.','광고 허용','허용 안 함','광고 설정','광고 동의 철회','개인정보처리방침'],
 es:['Publicidad','Preferencias de publicidad','Con tu permiso, Google puede usar cookies y datos del dispositivo para anuncios no personalizados, medición y prevención del fraude.','Permitir publicidad','No permitir','Preferencias de publicidad','Retirar permiso','Privacidad'],
 'pt-BR':['Publicidade','Preferências de publicidade','Com sua permissão, o Google pode usar cookies e dados do dispositivo para anúncios não personalizados, medição e prevenção de fraudes.','Permitir publicidade','Não permitir','Preferências de publicidade','Retirar permissão','Privacidade'],
 fr:['Publicité','Choix publicitaire','Avec votre accord, Google peut utiliser des cookies et des données de l’appareil pour des annonces non personnalisées, la mesure et la prévention des fraudes.','Autoriser','Refuser','Préférences publicitaires','Retirer mon accord','Confidentialité'],
 de:['Werbung','Werbeeinstellungen','Mit deiner Zustimmung kann Google Cookies und Gerätedaten für nicht personalisierte Werbung, Messung und Betrugsprävention verwenden.','Werbung erlauben','Ablehnen','Werbeeinstellungen','Zustimmung widerrufen','Datenschutz'],
 ru:['Реклама','Настройки рекламы','С вашего разрешения Google может использовать cookie и сведения об устройстве для неперсонализированной рекламы, измерения и предотвращения мошенничества.','Разрешить','Отказаться','Настройки рекламы','Отозвать разрешение','Конфиденциальность']
};
export const contentAdsCopy=lang=>Object.fromEntries(['label','title','body','allow','decline','preferences','withdraw','privacy'].map((key,i)=>[key,(rows[lang]||rows.en)[i]]));
