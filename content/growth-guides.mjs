export const quickGuides={
 en:['How to Play a Life Simulator Online: Start, Pause & Save','Start a free fictional life in this independent browser game. The controls below belong to 1in8billion.live, which is not the official 1in8b.life.',[
  'Choose Start a quick life on the homepage. It enables automatic choices; no account or download is needed.',
  'For a specific country, choose Choose your starting point, select the country and use the selected-country start button.',
  'Read the generated birth card and choose its start button to begin at age zero. Cancel returns to setup.',
  'Use ⏸ to pause and resume. The 1×, 2×, 4×, 8×, 12× and 16× buttons change playback speed, while Auto controls decisions.',
  'Return in the same browser to use Continue your life for an unfinished save. Keep site data intact; another device does not have that save.',
  'At the ending, save the life image or copy a compatible automatic replay link. A picture is a record, not a resumable save.'
 ]],
 ja:['80億分の1のようなゲームの始め方｜この独立版の操作ガイド','このガイドは独立サイト1in8billion.liveの操作説明です。原作1in8b.lifeとボタンや保存機能が同じとは限りません。無料・登録不要で始められます。',[
  'ホームで「クイック人生を始める」を押します。自動選択が有効になり、複雑な設定をせずに体験できます。',
  '国を決めたい場合は「生まれる国を選ぶ」を開き、国を選択して指定国で始めます。抽選モードとは別の操作です。',
  '出生カードを読み、開始ボタンを押して0歳から進めます。取り消すと設定へ戻れます。',
  '⏸で一時停止して文章を読み、もう一度押すと再開します。1×〜16×は進行速度、自動選択は意思決定の操作です。',
  '途中で戻る場合は同じ端末・同じブラウザを使います。未完了の保存があると「保存した人生を続ける」が表示されます。',
  '最後に画像を保存するか、対応する自動人生の再現リンクをコピーします。画像から途中の人生を復元することはできません。'
 ]],
 'zh-TW':['80億分之一怎麼玩？獨立版開始、加速與儲存教學','這是1in8billion.live獨立版本的操作教學，並非原作1in8b.life官方指南。免費線上玩，不需安裝或註冊。',[
  '首頁點「開始快速人生」，使用自動抉擇。想先體驗完整故事，可以保留預設設定。',
  '想指定出生國家，點「選擇出生地」，選國家後使用指定國家開始按鈕。這與隨機抽籤不同。',
  '閱讀出生卡並按開始，從零歲進行；取消會返回設定，不會開始這段人生。',
  '用⏸暫停閱讀，再按一次繼續。1×至16×調整速度，自動抉擇則代替你作選擇，兩者用途不同。',
  '未完成進度會存在此裝置的瀏覽器。保留網站資料，回首頁用「繼續已存人生」；換裝置不會自動同步。',
  '結局下載人生圖片，或複製符合條件的自動人生重現連結。圖片用來留念，不是可恢復的進度檔。'
 ]]
};
export const controlsGuides=[
 ['auto-mode','Life Simulator Auto Mode: Decisions Without Repeated Prompts','Auto makes decisions for your fictional character. Speed changes how quickly years advance; it does not turn automatic choices on. This guide describes this independent site’s actual controls.',[
  'Start a quick life and confirm the birth card. Quick enables automatic decisions by default. A manual pace lets you choose yourself.',
  'Find Auto in the life control row, below the character details. It is a separate button from the speed multipliers; on a phone, scroll to that row.',
  'Press Auto to toggle it. Stop auto means automatic choices are currently enabled. When enabling Auto while a decision waits, the game can resolve that decision immediately.',
  'Use Pause to read. Auto does not mean you must keep the clock running. Changing speed or pausing preserves an eligible automatic Replay v1.',
  'If you make manual decisions, the run may no longer qualify for reproducible replay. Keep a PNG instead, or start a fresh Quick life for replay sharing.'
 ],'Auto is a game policy, not a way to optimize a real life. No ending, lifetime or happy result is guaranteed. If time appears stuck, inspect Pause and any open decision or finance dialog. Background tabs can slow timers.'],
 ['speed-controls','Speed Up a Life: Pause, 1×–16× and Next Decision','Use speed multipliers to shorten waiting, Pause to read, and Next decision to move toward a choice. Auto decides for you. There is no separate “next year” button in this version.',[
  'Start and confirm a life. Locate the control row below the character’s details; on a phone you may need to scroll.',
  'Choose 1×, 2×, 4×, 8×, 12× or 16×. The active multiplier changes the tick interval. Quick is already a faster setup, so multiplier and starting pace both matter.',
  'Press ⏸ to stop the clock. Press the play icon again to resume. Raising speed while paused does not replace the need to resume.',
  'Use ⏭, titled Next decision, to fast-forward toward a decision. If a pending decision already exists, this control resolves it. It is not a guaranteed one-year step.',
  'Leave Auto off when you want to answer choices yourself. Turn it on if decision prompts, rather than elapsed time, are what you want to skip.',
  'Slow down again to inspect an event. A faster animation does not give a better statistical outcome; background-tab throttling may reduce the apparent speed.'
 ],'The game ends at a model outcome, not at a fixed viewing duration. Pausing and changing speed do not change the seeded automatic stream. Manually resolving a pending choice can make replay sharing ineligible.']
];
export const replayUpgrade=['Save Progress, Download a PNG or Share a Replay Link','Local continuation, an image and a Replay v1 URL preserve different things. None is an account-based cloud backup. This guide explains what a friend can reproduce and what stays on your device.',[
 'To continue an unfinished life, return to the same site in the same browser profile and use Continue your life. Browser storage is local; clearing it, private-mode closure or switching devices can remove access.',
 'To keep a visual ending, use the image download. Save the PNG or use your phone’s image-sharing sheet. It captures the displayed result and cannot restore a running game.',
 'To reproduce an eligible run, start a fresh Quick life and keep automatic decisions. At the ending choose Copy replay link. The link is Replay v1, not a serialized save.',
 'Send the copied link using your chosen messaging app. A recipient opens an invitation and explicitly chooses Replay this life; only that action starts and replaces their current local life.',
 'A normal website link opens the game but carries no outcome. Social link previews use a fixed site image because #run fragments do not create personalized server previews.',
 'After manual changes or resuming a save, use a PNG if the replay control says the run is ineligible. Unsupported or malformed replay links must not overwrite a stored life.'
 ],'Replay links include a version, seed, country, era, language and education setting. They contain no personal notes, imported family tree or local saved records. The sender still chooses where to share. No private life is automatically published or indexed. Future incompatible rules need a new replay version.'];

controlsGuides[0][2]='Automatic default choices and playback pace are separate. Pause life stops time, while the automatic-choice switch controls who chooses. Required manual choices appear beside the current event.';
controlsGuides[0][3]=['New lives start at reading pace,5seconds per year. To watch an automatic life, choose Watch in start customization.','Use Make choices for me in the top control bar. Its checked state stays visible even when playback is paused.','If a manual financial choice is waiting, answer its visible options or use the one-time default. Turning automatic choices on can resolve this waiting choice; it does not silently resume a user pause.','Pause and read stops time. Reflection notes are optional and opening them also pauses time.','Manual actions or resumed saves may be ineligible for Replay v1. The free memory PNG remains available.'];
controlsGuides[1][1]='Control the Pace of Your Life: Read, Watch or Step';controlsGuides[1][2]='Choose an explicit seconds-per-year pace. Reading uses5seconds per year, Watch uses1second per year, and Step advances only when you choose Next year.';controlsGuides[1][3]=['The playback controls appear above the current event. Pause life and Continue life control time.','Open Pace and choose Read, Watch or Step. Pace changes do not turn automatic choices on or off.','Pause and read freezes the current event. Continue life resumes when you are ready.','Next decision follows the same complete annual simulation until a decision point, then stops. It cannot silently resolve an already waiting choice.','In Step mode, choose Next year to advance one full year. It performs the normal events and annual settlement.','On return, saved pace and waiting-choice state restore with the life. Older saves without playback settings open paused with an explanation.'];
replayUpgrade[2]=replayUpgrade[2].map(x=>x.replaceAll('fresh Quick life','fresh Watch life'));
