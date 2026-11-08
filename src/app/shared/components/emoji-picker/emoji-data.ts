export interface EmojiItem {
  char: string;
  name: string;
}

export interface EmojiCategory {
  id: string;
  label: string;
  /** Font Awesome classes for the category tab. */
  icon: string;
  emojis: EmojiItem[];
}

/** Parses "😀 grinning face|😃 big eyes" into EmojiItem[]. */
function parse(list: string): EmojiItem[] {
  return list
    .split('|')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const space = entry.indexOf(' ');
      return { char: entry.slice(0, space), name: entry.slice(space + 1).toLowerCase() };
    });
}

export const DEFAULT_FREQUENT = ['👍', '😀', '😘', '😍', '😆', '😜', '😅', '😂'];

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'people',
    label: 'Smileys & People',
    icon: 'fa-regular fa-face-smile',
    emojis: parse(
      '😀 grinning face|😃 grinning face with big eyes|😄 grinning face with smiling eyes|😁 beaming face|😆 grinning squinting face|😅 grinning face with sweat|🤣 rolling on the floor laughing|😂 face with tears of joy|' +
        '🙂 slightly smiling face|🙃 upside down face|🫠 melting face|😉 winking face|😊 smiling face with smiling eyes|😇 smiling face with halo|🥰 smiling face with hearts|😍 heart eyes|' +
        '🤩 star struck|😘 face blowing a kiss|😗 kissing face|☺️ smiling face|😚 kissing face closed eyes|😙 kissing face smiling eyes|🥲 smiling face with tear|😋 face savoring food|' +
        '😛 face with tongue|😜 winking face with tongue|🤪 zany face|😝 squinting face with tongue|🤑 money mouth face|🤗 hugging face|🤭 hand over mouth|🫢 open eyes hand over mouth|' +
        '🫣 peeking eye|🤫 shushing face|🤔 thinking face|🫡 saluting face|🤐 zipper mouth|🤨 raised eyebrow|😐 neutral face|😑 expressionless face|' +
        '😶 face without mouth|🫥 dotted line face|😏 smirking face|😒 unamused face|🙄 rolling eyes|😬 grimacing face|😮‍💨 face exhaling|🤥 lying face|' +
        '😌 relieved face|😔 pensive face|😪 sleepy face|🤤 drooling face|😴 sleeping face|😷 medical mask|🤒 thermometer|🤕 head bandage|' +
        '🤢 nauseated face|🤮 vomiting|🤧 sneezing face|🥵 hot face|🥶 cold face|🥴 woozy face|😵 dizzy face|🤯 exploding head|' +
        '🤠 cowboy hat face|🥳 partying face|🥸 disguised face|😎 sunglasses|🤓 nerd face|🧐 monocle|😕 confused face|😟 worried face|' +
        '🙁 slightly frowning face|☹️ frowning face|😮 open mouth|😯 hushed face|😲 astonished face|😳 flushed face|🥺 pleading face|🥹 holding back tears|' +
        '😦 frowning open mouth|😧 anguished face|😨 fearful face|😰 anxious sweat|😥 sad but relieved|😢 crying face|😭 loudly crying|😱 screaming in fear|' +
        '😖 confounded face|😣 persevering face|😞 disappointed face|😓 cold sweat|😩 weary face|😫 tired face|🥱 yawning face|😤 triumph|' +
        '😡 pouting face|😠 angry face|🤬 symbols on mouth|😈 smiling horns|👿 imp|💀 skull|☠️ skull crossbones|💩 pile of poo|' +
        '🤡 clown face|👹 ogre|👺 goblin|👻 ghost|👽 alien|👾 alien monster|🤖 robot|😺 grinning cat|' +
        '👋 waving hand|🤚 raised back of hand|🖐️ hand fingers splayed|✋ raised hand|🖖 vulcan salute|👌 ok hand|🤌 pinched fingers|🤏 pinching hand|' +
        '✌️ victory hand|🤞 crossed fingers|🫰 index thumb crossed|🤟 love you gesture|🤘 sign of the horns|🤙 call me hand|👈 pointing left|👉 pointing right|' +
        '👆 pointing up|👇 pointing down|☝️ index pointing up|🫵 pointing at viewer|👍 thumbs up|👎 thumbs down|✊ raised fist|👊 oncoming fist|' +
        '🤛 left facing fist|🤜 right facing fist|👏 clapping hands|🙌 raising hands|🫶 heart hands|👐 open hands|🤲 palms up together|🙏 folded hands pray|' +
        '💪 flexed biceps|🧠 brain|👀 eyes|👶 baby|🧒 child|👦 boy|👧 girl|🧑 person|' +
        '👨 man|👩 woman|🧓 older person|👴 old man|👵 old woman|💁 person tipping hand|🙋 person raising hand|🤷 person shrugging'
    ),
  },
  {
    id: 'nature',
    label: 'Animals & Nature',
    icon: 'fa-solid fa-paw',
    emojis: parse(
      '🐶 dog face|🐱 cat face|🐭 mouse face|🐹 hamster|🐰 rabbit face|🦊 fox|🐻 bear|🐼 panda|' +
        '🐨 koala|🐯 tiger face|🦁 lion|🐮 cow face|🐷 pig face|🐸 frog|🐵 monkey face|🙈 see no evil monkey|' +
        '🐔 chicken|🐧 penguin|🐦 bird|🐤 baby chick|🦆 duck|🦅 eagle|🦉 owl|🦇 bat|' +
        '🐺 wolf|🐗 boar|🐴 horse face|🦄 unicorn|🐝 honeybee|🐛 bug|🦋 butterfly|🐌 snail|' +
        '🐞 lady beetle|🐢 turtle|🐍 snake|🦎 lizard|🐙 octopus|🦑 squid|🦀 crab|🐠 tropical fish|' +
        '🐬 dolphin|🐳 whale|🦈 shark|🐊 crocodile|🐘 elephant|🦒 giraffe|🐪 camel|🐎 horse|' +
        '🌵 cactus|🎄 christmas tree|🌲 evergreen tree|🌳 tree|🌴 palm tree|🌱 seedling|🌿 herb|🍀 four leaf clover|' +
        '🍁 maple leaf|🍂 fallen leaf|🌷 tulip|🌹 rose|🌺 hibiscus|🌸 cherry blossom|🌼 blossom|🌻 sunflower|' +
        '🌞 sun with face|🌝 full moon face|🌙 crescent moon|⭐ star|🌟 glowing star|✨ sparkles|⚡ lightning|🔥 fire|' +
        '🌈 rainbow|☀️ sun|⛅ sun behind cloud|☁️ cloud|🌧️ rain cloud|⛄ snowman|❄️ snowflake|🌊 water wave'
    ),
  },
  {
    id: 'foods',
    label: 'Food & Drink',
    icon: 'fa-solid fa-apple-whole',
    emojis: parse(
      '🍏 green apple|🍎 red apple|🍐 pear|🍊 tangerine orange|🍋 lemon|🍌 banana|🍉 watermelon|🍇 grapes|' +
        '🍓 strawberry|🫐 blueberries|🍈 melon|🍒 cherries|🍑 peach|🥭 mango|🍍 pineapple|🥥 coconut|' +
        '🥝 kiwi|🍅 tomato|🍆 eggplant|🥑 avocado|🥦 broccoli|🥬 leafy green|🥒 cucumber|🌶️ hot pepper|' +
        '🌽 corn|🥕 carrot|🧄 garlic|🧅 onion|🥔 potato|🍞 bread|🥐 croissant|🥖 baguette|' +
        '🧀 cheese|🥚 egg|🍳 cooking|🥞 pancakes|🥓 bacon|🍗 poultry leg|🍖 meat on bone|🌭 hot dog|' +
        '🍔 hamburger burger|🍟 french fries|🍕 pizza|🥪 sandwich|🌮 taco|🌯 burrito|🥗 salad|🍝 spaghetti|' +
        '🍜 noodles|🍲 pot of food|🍛 curry rice|🍣 sushi|🍤 fried shrimp|🍙 rice ball|🍚 cooked rice|🍦 ice cream|' +
        '🍩 doughnut|🍪 cookie|🎂 birthday cake|🍰 shortcake|🧁 cupcake|🍫 chocolate|🍬 candy|🍭 lollipop|' +
        '☕ hot coffee|🍵 tea|🧃 juice box|🥤 cup with straw|🧋 bubble tea|🍺 beer|🥂 clinking glasses|🍷 wine glass'
    ),
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: 'fa-solid fa-basketball',
    emojis: parse(
      '⚽ soccer ball football|🏀 basketball|🏈 american football|⚾ baseball|🥎 softball|🎾 tennis|🏐 volleyball|🏉 rugby|' +
        '🎱 pool 8 ball|🏓 ping pong|🏸 badminton|🏒 ice hockey|🥅 goal net|⛳ flag in hole golf|🏹 bow and arrow|🎣 fishing|' +
        '🥊 boxing glove|🥋 martial arts|🎽 running shirt|🛹 skateboard|⛸️ ice skate|🎿 skis|🏂 snowboarder|🏋️ weight lifting|' +
        '🤸 cartwheel|⛹️ bouncing ball|🤺 fencing|🏊 swimming|🚴 biking|🏆 trophy|🥇 gold medal|🥈 silver medal|' +
        '🥉 bronze medal|🏅 sports medal|🎖️ military medal|🎗️ reminder ribbon|🎫 ticket|🎪 circus tent|🎭 performing arts|🎨 artist palette|' +
        '🎬 clapper board|🎤 microphone|🎧 headphone|🎼 musical score|🎹 piano|🥁 drum|🎷 saxophone|🎺 trumpet|' +
        '🎸 guitar|🎻 violin|🎲 game die|♟️ chess pawn|🎯 direct hit|🎳 bowling|🎮 video game|🧩 puzzle piece'
    ),
  },
  {
    id: 'places',
    label: 'Travel & Places',
    icon: 'fa-solid fa-car',
    emojis: parse(
      '🚗 automobile car|🚕 taxi|🚙 suv|🚌 bus|🏎️ racing car|🚓 police car|🚑 ambulance|🚒 fire engine|' +
        '🚚 delivery truck|🚜 tractor|🏍️ motorcycle|🛵 motor scooter|🚲 bicycle|🛴 kick scooter|🚨 police light|🚦 traffic light|' +
        '🚂 locomotive|🚆 train|🚇 metro|✈️ airplane|🛫 departure|🛬 arrival|🚀 rocket|🛸 flying saucer|' +
        '🚁 helicopter|⛵ sailboat|🚤 speedboat|🛳️ passenger ship|⚓ anchor|🗺️ world map|🗽 statue of liberty|🗼 tokyo tower|' +
        '🏰 castle|🏯 japanese castle|🏟️ stadium|🎡 ferris wheel|🎢 roller coaster|⛲ fountain|🏖️ beach|🏝️ desert island|' +
        '🏜️ desert|🌋 volcano|⛰️ mountain|🏕️ camping|🏠 house|🏡 house with garden|🏢 office building|🏥 hospital|' +
        '🏦 bank|🏨 hotel|🏫 school|🕌 mosque|⛪ church|🕋 kaaba|🌃 night with stars|🌅 sunrise'
    ),
  },
  {
    id: 'objects',
    label: 'Objects',
    icon: 'fa-regular fa-lightbulb',
    emojis: parse(
      '⌚ watch|📱 mobile phone|💻 laptop|⌨️ keyboard|🖥️ desktop computer|🖨️ printer|🖱️ computer mouse|💾 floppy disk|' +
        '💿 optical disk|📷 camera|📸 camera with flash|📹 video camera|🎥 movie camera|📞 telephone|📺 television|📻 radio|' +
        '⏰ alarm clock|⌛ hourglass|🔋 battery|🔌 plug|💡 light bulb|🔦 flashlight|🕯️ candle|💸 money with wings|' +
        '💵 dollar|💰 money bag|💳 credit card|💎 gem stone|🔧 wrench|🔨 hammer|🛠️ tools|⚙️ gear|' +
        '🔫 water pistol|💣 bomb|🔪 kitchen knife|🛡️ shield|🔮 crystal ball|💊 pill|💉 syringe|🧬 dna|' +
        '🔭 telescope|🔬 microscope|🧹 broom|🧸 teddy bear|🎁 wrapped gift|🎈 balloon|🎉 party popper|🎊 confetti ball|' +
        '✉️ envelope|📦 package|📝 memo|📚 books|📖 open book|🔖 bookmark|📌 pushpin|📎 paperclip|' +
        '✂️ scissors|🖊️ pen|✏️ pencil|🔍 magnifying glass|🔒 locked|🔓 unlocked|🔑 key|🗝️ old key'
    ),
  },
  {
    id: 'symbols',
    label: 'Symbols',
    icon: 'fa-solid fa-icons',
    emojis: parse(
      '❤️ red heart|🧡 orange heart|💛 yellow heart|💚 green heart|💙 blue heart|💜 purple heart|🖤 black heart|🤍 white heart|' +
        '🤎 brown heart|💔 broken heart|❣️ heart exclamation|💕 two hearts|💞 revolving hearts|💓 beating heart|💗 growing heart|💖 sparkling heart|' +
        '💘 heart with arrow|💝 heart with ribbon|💯 hundred points|💢 anger symbol|💥 collision|💫 dizzy|💦 sweat droplets|💨 dashing away|' +
        '💬 speech balloon|💭 thought balloon|💤 zzz|☮️ peace|☯️ yin yang|♻️ recycling|✅ check mark button|☑️ check box|' +
        '✔️ check mark|❌ cross mark|❎ cross mark button|➕ plus|➖ minus|➗ divide|✖️ multiply|❓ question mark|' +
        '❔ white question|❗ exclamation|‼️ double exclamation|⁉️ exclamation question|⚠️ warning|🚫 prohibited|⛔ no entry|🔞 no one under eighteen|' +
        '🔴 red circle|🟠 orange circle|🟡 yellow circle|🟢 green circle|🔵 blue circle|🟣 purple circle|⚫ black circle|⚪ white circle|' +
        '🔶 orange diamond|🔷 blue diamond|▶️ play button|⏸️ pause button|⏹️ stop button|🔁 repeat|🔀 shuffle|🆗 ok button|' +
        '🆕 new button|🆓 free button|🆒 cool button|🔝 top arrow|🔜 soon arrow|➡️ right arrow|⬅️ left arrow|⬆️ up arrow'
    ),
  },
  {
    id: 'flags',
    label: 'Flags',
    icon: 'fa-regular fa-flag',
    emojis: parse(
      '🏁 chequered flag|🚩 triangular flag|🎌 crossed flags|🏴 black flag|🏳️ white flag|🏳️‍🌈 rainbow flag|🇪🇬 egypt|🇸🇦 saudi arabia|' +
        '🇦🇪 united arab emirates|🇵🇸 palestine|🇯🇴 jordan|🇰🇼 kuwait|🇶🇦 qatar|🇧🇭 bahrain|🇴🇲 oman|🇱🇧 lebanon|' +
        '🇸🇾 syria|🇮🇶 iraq|🇲🇦 morocco|🇩🇿 algeria|🇹🇳 tunisia|🇱🇾 libya|🇸🇩 sudan|🇾🇪 yemen|' +
        '🇺🇸 united states|🇬🇧 united kingdom|🇨🇦 canada|🇫🇷 france|🇩🇪 germany|🇮🇹 italy|🇪🇸 spain|🇵🇹 portugal|' +
        '🇳🇱 netherlands|🇧🇪 belgium|🇨🇭 switzerland|🇸🇪 sweden|🇳🇴 norway|🇹🇷 turkey|🇷🇺 russia|🇨🇳 china|' +
        '🇯🇵 japan|🇰🇷 south korea|🇮🇳 india|🇧🇷 brazil|🇦🇷 argentina|🇲🇽 mexico|🇦🇺 australia|🇿🇦 south africa'
    ),
  },
];

