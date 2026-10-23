// Original fiction. Real institutions are background possibilities, not promises of access.
// Each pack has a distinct setting and three authored turning points, not a country-name substitution.
export const places={
 CHN:{en:'a neighborhood cultural center',zh:'社区文化馆',objectEn:'a folded workshop timetable',objectZh:'折过一道的活动时间表',reunionEn:'the classroom duty roster',reunionZh:'当年轮值值日的名单',familyEn:'sorting old photographs at the kitchen table',familyZh:'在餐桌边整理旧照片'},
 JPN:{en:'a kominkan community learning room',zh:'公民馆的学习活动室',objectEn:'a handwritten practice sheet',objectZh:'手写的练习页',reunionEn:'the school library borrowing slip',reunionZh:'学校图书室的借阅单',familyEn:'labeling a small box of family mementos',familyZh:'给一小盒家中纪念物写标签'},
 IND:{en:'a local reading group',zh:'当地读书小组',objectEn:'a page with notes in two languages',objectZh:'写着两种语言笔记的一页纸',reunionEn:'the story you once read aloud together',reunionZh:'你们曾一起朗读过的故事',familyEn:'retelling a story in the language used at home',familyZh:'用家里熟悉的语言重讲一个故事'},
 USA:{en:'a public library creative workshop',zh:'公共图书馆的创意工作坊',objectEn:'a penciled plan for an unfinished project',objectZh:'用铅笔画下、尚未完成的作品计划',reunionEn:'the school project you once presented together',reunionZh:'你们曾一起展示的学校小项目',familyEn:'recording the story behind a family photograph',familyZh:'录下家中一张照片背后的故事'},
 BRA:{en:'a community culture group',zh:'社区文化小组',objectEn:'a worn notebook of creative ideas',objectZh:'记着创作点子的旧本子',reunionEn:'the classroom display you once made together',reunionZh:'你们曾一起布置的班级展示',familyEn:'putting names beside an old family photograph',familyZh:'在一张旧家庭照片旁写下名字'},
 NGA:{en:'a library reading activity',zh:'图书馆的阅读活动',objectEn:'a library leaflet tucked into an old notebook',objectZh:'夹在旧本子里的图书馆活动单',reunionEn:'the classroom reading you once practiced together',reunionZh:'你们曾一起练习的课堂朗读',familyEn:'writing down a family story in the words it was told',familyZh:'照着家人讲述时的用词，记下一个家中故事'}
};
// Ten original everyday scenes per country. Shared humanity stays broader than local scenery.
const daily={
 CHN:`study|1|You find a handwritten comment inside a borrowed book. For once, the page feels like a conversation.|借来的书里夹着一段手写评语。那一页忽然像一次对话。
home|7|You stop at a cultural center noticeboard. A beginner activity catches your eye; you copy down the contact details without committing yet.|你在文化馆的布告栏前停了一会儿。一个入门活动吸引了你，你记下联系方式，暂时没有报名。
family|3|You and {person} sort photographs at a table. The name on one photograph takes longer to remember than the occasion.|你和{person}在桌边整理照片。一张照片上的名字，比拍照那天的场景更难想起来。
friendship|2|On the way home, {person} waits while you finish a story. This time, nobody hurries to give advice.|回去的路上，{person}等你把话讲完。这一次，没有人急着给建议。
work|10|You keep a note for a small project you might try after work. Today, keeping the idea is enough.|你留下一张便条，记下下班后想试的小计划。今天，先把念头留下就够了。
childhood|0|You make a tiny stage from a cardboard box. The first audience is a row of toys.|你用纸箱搭了一个小舞台，第一排观众是几件玩具。
wellbeing|11|You choose a quieter route after a crowded afternoon. Nothing is achieved; you arrive home less tense.|忙乱了一下午，你绕了一条安静些的路。没有多完成一件事，但回家时放松了一点。
home|5|At home you mend the loose corner of a notebook. You keep the old cover instead of replacing it.|你在家粘好一本本子翘起的角，没有换掉已经用旧的封面。
reflection|7|A familiar tune brings back an ordinary room from earlier life. You remember its light more clearly than its furniture.|一段熟悉的旋律让你想起早些年待过的一间屋子。比起家具，你更记得当时的光。
family|3|{person} tells you how an everyday object came into the household. You had seen it for years without knowing the story.|{person}讲起家中一件普通物品的来历。你见过它很多年，今天才知道它的故事。`,
 JPN:`study|1|You stay a moment longer at the school library shelf. A thin book contains an idea you want to try for yourself.|你在学校图书室的书架旁多停了一会儿，一本薄书里有个想亲手试试的点子。
home|7|A kominkan notice lists beginner learning activities. You mark one that allows people to start without bringing finished work.|公民馆的通知列着入门学习活动，你记下一个不需要带成品就能参加的项目。
family|3|You and {person} label a box of mementos. Some descriptions are only a few words, but you recognize the handwriting.|你和{person}给一盒纪念物写标签。有的说明只有几个字，你却认得那笔迹。
friendship|2|{person} shows you a penciled note from school. You disagree about one detail and enjoy remembering it differently.|{person}给你看一张求学时的铅笔便条。你们对一个细节记得不同，却觉得这样也很有趣。
work|10|You put away work materials and leave a small cleared space for something of your own.|你收好工作的材料，给一件属于自己的小事留出一块空桌面。
childhood|0|You fold paper into something that will not quite stand up. You make a second base instead of starting over.|你折的纸模型总是站不稳，于是给它加了一个底座，没有全部重来。
wellbeing|11|You sit beside an open window and let a quiet part of the day stay quiet.|你在开着的窗边坐了一会儿，让安静的一小段时间，就这样安静地过去。
home|5|An old cloth becomes a cover for a notebook. The uneven seam makes it easy to recognize.|一块旧布成了本子的封套。那道不太齐的线，让它很容易被认出来。
reflection|7|You remember the walk after an ordinary lesson. It was not a milestone, yet the route has stayed with you.|你想起某次普通课程结束后的回家路。那不算人生大事，你却一直记得。
family|3|{person} asks which small object you would keep. You choose one whose story you can actually tell.|{person}问你想留下哪件小物品，你选了一件自己能讲出故事的。`,
 IND:`study|1|At a school reading activity, you hear the same passage explained in different words. One version finally makes sense to you.|学校的阅读活动上，同一段话被换了几种说法。其中一种，终于让你明白了。
home|7|A reading group invitation leaves room for more than one language. You note an activity without deciding what language you will use.|一张读书小组的邀请允许使用不止一种语言。你记下活动，暂时没决定用哪种语言表达。
family|3|You ask {person} to repeat a phrase used at home. Writing it down takes more patience than you expected.|你请{person}重说一句家里常用的话。把它写下来，比想象中更需要耐心。
friendship|2|You and {person} remember a story read at school. Each of you remembers a different character most clearly.|你和{person}想起学校读过的一个故事，你们各自最记得的，竟是不同的人物。
work|10|After work, you find an old page of ideas. You choose one line to keep visible instead of turning it into another task list.|下班后，你翻到一页旧点子，选了一行放在看得见的地方，没有把它变成另一张任务清单。
childhood|0|You tell a picture-book story using your own words. The pictures stay the same; your version changes at every telling.|你用自己的话讲图画书。图还是那些图，每次讲出来却不太一样。
wellbeing|11|You take a short break from answering questions. There is room for one question of your own.|你暂停了一会儿回答别人的问题，给自己的一个疑问留了点位置。
home|5|You sew a loose button back onto a bag. A familiar object gets another ordinary day.|你把包上松开的纽扣重新缝好。一件熟悉的东西，又陪你过了普通的一天。
reflection|7|You read a note in a language you once practiced. Some words take time to return; you let them.|你读一张用曾经练习的语言写下的便条，有些词需要慢慢想起来，你没有催自己。
family|3|{person} tells a familiar story but changes the ending this time. You ask what made the difference.|{person}讲起一个听过的故事，这次的结尾却有一点不同。你问了问，为什么会这样。`,
 USA:`study|1|A school project leaves you with a rough sketch instead of a finished answer. You keep the sketch after the assignment ends.|一份学校小项目留下的是草图，而不是完整答案。交完作业，你仍留着那张草图。
home|7|You read the beginner instructions for a library creative workshop. You note that joining would take planning, not special talent.|你读了图书馆创意工作坊的入门说明。参加需要安排时间，却不要求先有出色的作品。
family|3|You and {person} record the story behind a photograph. A pause in the recording becomes part of the story.|你和{person}录下照片背后的故事。录音里的一段停顿，也成了故事的一部分。
friendship|2|{person} remembers a school presentation you thought everyone had forgotten. The remembered detail is kindly specific.|{person}还记得一次你以为大家早就忘了的学校展示。对方记得的细节，具体而温柔。
work|10|You decline one optional task and spend the cleared time on a small unfinished project at home.|你推掉了一项可选任务，把留出的时间用在家中一件未完成的小作品上。
childhood|0|You make a neighborhood out of blocks. A crooked little building becomes the place your toys keep returning to.|你用积木搭了一片街区，玩具总爱回到那座有点歪的小屋子里。
wellbeing|11|You walk without tracking a distance. At the end, you remember a tree rather than a number.|你散步时没有记录里程。结束时，记住的是一棵树，而不是一个数字。
home|5|You make a small repair using instructions from a borrowed book. You check each step instead of pretending you already know.|你照着借来的书做了一次小修理，一步步核对，没有假装自己早就会了。
reflection|7|An old project file contains an early mistake. You keep it beside the improved version rather than deleting the evidence of learning.|一份旧项目里留着早期的错误，你把它和改进后的版本放在一起，没有删掉学习的痕迹。
family|3|{person} asks to hear a memory you usually leave out. You tell the ordinary part first.|{person}想听听一段你平常不会讲的往事。你先讲了其中最普通的部分。`,
 BRA:`study|1|Your class makes a display together. One small piece of your work stays in the corner where you can recognize it.|班上一起布置展示，你的一小份作品留在角落，自己一眼就能认出来。
home|7|A community culture group displays work in progress. You find the unfinished pieces easier to approach than the polished ones.|社区文化小组展示了创作中的作品。比起完成得很漂亮的，你更愿意靠近那些还没做完的。
family|3|You and {person} write names beside a family photograph. An unknown face remains an honest blank.|你和{person}在家庭照片旁写下名字。有一张不认识的面孔，你们如实留了空白。
friendship|2|{person} recalls the classroom display you made together. You laugh about the part held up by too much tape.|{person}想起你们一起做的班级展示，你们笑着说起那个贴了太多胶带的角落。
work|10|You save a little time after work for a creative idea. You do not need to make it profitable for it to belong in your day.|下班后，你给一个创作点子留了一点时间。它不必先能赚钱，才配占据一天的一小部分。
childhood|0|You turn an empty package into a pretend shop. The first thing you trade is a made-up story.|你把空包装变成一家假想小店，第一件交换出去的东西，是一个现编的故事。
wellbeing|11|You sit outside for a little while and notice a familiar sound you had stopped hearing.|你在户外坐了一会儿，重新听见一种熟悉却很久没留意的声音。
home|5|You rearrange a small corner to make room for your notebook. The room has not grown, but one idea now has a place.|你重新整理一个小角落，给本子腾出位置。房间没有变大，一个念头却有了落脚处。
reflection|7|A page from an old creative notebook surprises you. You like a detail your earlier self did not seem to value.|旧创作本上的一页让你有些惊喜。你喜欢上了一个当年的自己似乎没重视的细节。
family|3|{person} remembers who took the photograph. For a moment you talk about the person behind the camera, too.|{person}想起了是谁拍下那张照片。那一会儿，你们也聊起了镜头后的人。`,
 NGA:`study|1|At a classroom reading, you volunteer one sentence. The voice is yours even when the words belong to the book.|课堂朗读时，你主动读了一句话。文字属于书，声音却是你自己的。
home|7|You read a library activity leaflet. One session invites people to bring a story they remember, rather than a finished essay.|你读到一张图书馆活动单。其中一次活动请人带一个记得的故事，不必先写成完整文章。
family|3|You write down a story as {person} tells it. You ask to keep a particular turn of phrase instead of replacing it with your own.|你照着{person}的讲述记故事。你特意问了问，想保留一句原话，没有换成自己的说法。
friendship|2|{person} remembers a classroom reading you practiced together. You try one line again and both lose your place.|{person}想起你们一起练习的课堂朗读。你们又试着读了一句，结果两个人都忘了后面。
work|10|You find a library leaflet inside your work notebook. You leave it there as a possibility, not another obligation.|你在工作本子里发现一张图书馆活动单。你让它继续夹着，作为一种可能，而不是另一项义务。
childhood|0|You give your toys different voices. One soft-spoken character gets the last word for once.|你给玩具编了不同的声音。这一次，让那个说话轻轻的角色说了最后一句。
wellbeing|11|You put a busy conversation aside and listen to the quiet around you. A short pause changes the rest of the evening.|你暂时放下热闹的交谈，听了听身边的安静。一个小停顿，让后半个晚上有所不同。
home|5|You protect the cover of a well-used book. The marks inside remain part of its history.|你给一本常翻的书护好封面，里面的使用痕迹仍然留着。
reflection|7|You reread a sentence copied years earlier. You no longer agree with all of it, but remember why you kept it.|你重读多年前抄下的一句话。现在已不完全认同，却仍记得当时为什么要留下它。
family|3|{person} asks you to tell the story back. You check a detail instead of confidently inventing it.|{person}请你把那个故事讲回来。一个细节记不清，你认真确认，没有自信地编下去。`
};
const ages={study:[6,26,'school'],home:[16,95,'home'],family:[8,95,'home'],friendship:[12,85,'outside'],work:[20,60,'work'],childhood:[3,11,'home'],wellbeing:[12,100,'quiet'],reflection:[45,105,'quiet']};
export const localCatalog=Object.entries(daily).flatMap(([country,lines])=>lines.split('\n').map((line,i)=>{const[category,artCell,en,zh]=line.split('|'),[min,max,scene]=ages[category];return{id:`s5.local.${country}.${i+1}`,country,category,artCell:+artCell,en,zh,min,max,scene,cooldown:12,requires:category==='family'?'family-memory':null,interaction:['family','friendship'].includes(category)?'people':category==='reflection'?'letter':'explore'};}));
