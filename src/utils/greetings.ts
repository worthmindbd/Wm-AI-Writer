// Tone-based greetings system
// Each tone has a pool of greetings that match its personality

export type ToneType = 'professional' | 'casual' | 'friendly' | 'witty' | 'inspirational' | 'bold' | 'empathetic' | 'storytelling'

const GREETINGS: Record<ToneType, string[]> = {
    professional: [
        'Hello everyone,',
        'Welcome, readers.',
        'Greetings,',
        'Hello and welcome,',
        'Good day, readers.',
        'Welcome to today\'s discussion,',
        'Thank you for joining us,',
        'Hello, professionals,',
    ],
    casual: [
        'Hey there!',
        'What\'s up, everyone!',
        'Yo, what\'s good!',
        'Hey hey!',
        'Alright, let\'s get into it!',
        'Sup, folks!',
        'Hey, good to see you here!',
        'What\'s going on, everyone!',
    ],
    friendly: [
        'Hi friends!',
        'Hello, good people!',
        'Hey lovely readers!',
        'Hi there, wonderful people!',
        'Hello, beautiful humans!',
        'Hey friends, welcome!',
        'Hi everyone, glad you\'re here!',
        'Hello, awesome readers!',
        'Hey there, welcome aboard!',
    ],
    witty: [
        'Well, well, well… look who showed up!',
        'Buckle up, folks — this is gonna be good!',
        'Plot twist: you\'re about to learn something cool!',
        'Spoiler alert: this article slaps!',
        'You clicked, and I\'m not mad about it!',
        'Oh, you\'re here? Excellent taste!',
        'Another day, another brilliant read — let\'s go!',
        'Grab your coffee, this one\'s a ride!',
    ],
    inspirational: [
        'Dream big, friends!',
        'Hello, beautiful souls!',
        'Rise and shine, everyone!',
        'Hey there, future changemakers!',
        'Welcome, amazing people!',
        'Hello to everyone chasing greatness!',
        'Hey, you magnificent human!',
        'Welcome, dreamers and doers!',
        'Hello, world changers!',
    ],
    bold: [
        'Listen up!',
        'No fluff — let\'s go!',
        'Real talk, people.',
        'Straight to the point today.',
        'Guys, we need to talk about this.',
        'Let\'s cut the noise.',
        'Here\'s what nobody\'s telling you.',
        'Zero sugar-coating — let\'s dive in.',
        'Alright, no beating around the bush.',
    ],
    empathetic: [
        'Hey, I hear you.',
        'Hello, dear reader.',
        'I know the feeling…',
        'Hey there, you\'re not alone in this.',
        'Hello, friend — I\'ve been there too.',
        'Hi, and thanks for being here.',
        'Hey, let\'s figure this out together.',
        'Hello, and take a deep breath — we\'ve got this.',
        'Hi there, I understand what you\'re going through.',
    ],
    storytelling: [
        'Gather round, folks!',
        'Let me tell you a story…',
        'Picture this…',
        'So there I was…',
        'Once upon a time (in the real world)…',
        'Here\'s something that happened to me recently…',
        'Grab a seat — you\'ll want to hear this.',
        'I\'ve got a story that\'ll change how you think about this…',
        'You know what? Let me paint you a picture.',
    ],
}

/** Get a random greeting for a specific tone */
export function getGreetingForTone(tone: ToneType): string {
    const pool = GREETINGS[tone] || GREETINGS.friendly
    return pool[Math.floor(Math.random() * pool.length)]
}

/** Get the full list of greetings for a tone (for prompt injection) */
export function getGreetingsPool(tone: ToneType): string[] {
    return GREETINGS[tone] || GREETINGS.friendly
}

/** Build a prompt instruction telling AI to start with a greeting */
export function buildGreetingPrompt(tone: ToneType): string {
    const pool = getGreetingsPool(tone)
    const examples = pool.slice(0, 5).map(g => `"${g}"`).join(', ')
    return `\nGREETING REQUIREMENT (IMPORTANT):
- Start the very first line of the article with a warm greeting that matches the ${tone} tone.
- Pick ONE greeting naturally from styles like: ${examples}
- The greeting should flow directly into the opening sentence — don't just put it alone on a line.
- After the greeting, smoothly transition into the intro paragraph.
- Do NOT use generic greetings that don't match the tone.`
}

/** Get expanded tone description for better AI understanding */
export function getToneDescription(tone: ToneType): string {
    const descriptions: Record<ToneType, string> = {
        professional: 'Professional & authoritative — confident, knowledgeable, polished. Like a trusted industry expert sharing insights.',
        casual: 'Casual & conversational — relaxed, natural, like talking to a friend over coffee. Use slang and informal expressions where appropriate.',
        friendly: 'Friendly & warm — approachable, encouraging, inclusive. Like a helpful neighbor who genuinely wants to help.',
        witty: 'Witty & clever — smart humor, playful wordplay, entertaining but informative. Like a fun professor who keeps you engaged.',
        inspirational: 'Inspirational & motivating — uplifting, empowering, forward-looking. Like a mentor who believes in the reader\'s potential.',
        bold: 'Bold & direct — no-nonsense, straight-talking, opinionated. Like a brutally honest friend who tells it like it is.',
        empathetic: 'Empathetic & understanding — compassionate, relatable, validating. Like a trusted confidant who truly gets what the reader faces.',
        storytelling: 'Storytelling & narrative — engaging stories, vivid descriptions, personal anecdotes. Like a captivating storyteller around a campfire.',
    }
    return descriptions[tone] || descriptions.friendly
}
