const copies={
 en:['Continue','Rebirth','View life memories','Your saved life could not be restored. You can start a new life.','years'],
 'zh-CN':['继续','重新出生','查看人生回忆','未能恢复这份存档，你可以开始新人生。','岁'],
 'zh-TW':['繼續','重新出生','查看人生回憶','未能恢復這份存檔，你可以開始新人生。','歲'],
 ja:['続ける','生まれ直す','人生の思い出を見る','保存した人生を復元できません。新しい人生を始められます。','歳'],
 ko:['이어하기','다시 태어나기','인생 추억 보기','저장된 삶을 복원하지 못했습니다. 새로운 삶을 시작할 수 있습니다.','세'],
 es:['Continuar','Volver a nacer','Ver recuerdos de vida','No se pudo restaurar la vida guardada. Puedes iniciar otra.','años'],
 'pt-BR':['Continuar','Renascer','Ver lembranças da vida','Não foi possível restaurar a vida salva. Você pode começar outra.','anos'],
 fr:['Continuer','Renaître','Voir les souvenirs de vie','La vie enregistrée n’a pas pu être restaurée. Vous pouvez en commencer une autre.','ans'],
 de:['Fortsetzen','Neu geboren werden','Lebenserinnerungen ansehen','Das gespeicherte Leben konnte nicht wiederhergestellt werden. Du kannst ein neues beginnen.','Jahre'],
 ru:['Продолжить','Родиться заново','Посмотреть воспоминания','Не удалось восстановить сохранённую жизнь. Вы можете начать новую.','лет']
};
export const startDockCopy=lang=>copies[lang]||copies.en;
export function resumeLabel(copy,country,age){return `${copy[0]} · ${country} · ${age} ${copy[4]}`;}

const dismiss={"en": "Hide quick actions", "zh-CN": "收起快捷操作", "zh-TW": "收起快捷操作", "ja": "クイック操作を隠す", "ko": "빠른 작업 숨기기", "es": "Ocultar acciones rápidas", "pt-BR": "Ocultar ações rápidas", "fr": "Masquer les actions rapides", "de": "Schnellaktionen ausblenden", "ru": "Скрыть быстрые действия"};
export const dismissDockLabel=lang=>dismiss[lang]||dismiss.en;
