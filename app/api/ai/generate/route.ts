import { NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'
import { cookies } from 'next/headers'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'
import { FormSpecSchema } from '@/lib/validators/form'
import { Type } from '@google/genai'

export async function POST(request: Request) {
  try {
    const { description } = await request.json()
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Missing description' }, { status: 400 })
    }

    // Enforce plan limits: free users max 10 AI generations/day
    const cookieStore = cookies()
    const supabase = createSupabaseServer(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('plan').eq('user_id', user.id).single()
    if ((profile?.plan ?? 'free') === 'free') {
      const { count } = await supabase
        .from('ai_generations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      if ((count ?? 0) >= 10) {
        return NextResponse.json({ error: 'Daily AI generation limit reached. Upgrade to Pro.' }, { status: 429 })
      }
    }

    const ai = getGeminiClient()

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert form designer. Given this description, generate a concise form structure suitable for a SaaS form builder. Use practical defaults.\n\nSTRICT OUTPUT REQUIREMENTS:\n- Return ONLY JSON (no code fences, no prose).\n- Match the provided schema exactly.\n\nDescription: ${description}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING, nullable: true },
            fields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: [
                    'text','textarea','email','number','phone','url','select','radio','checkbox','date','time','rating','address','file','color'
                  ] },
                  label: { type: Type.STRING },
                  placeholder: { type: Type.STRING, nullable: true },
                  required: { type: Type.BOOLEAN, nullable: true },
                  options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true }
                },
                required: ['type','label'],
                propertyOrdering: ['type','label','placeholder','required','options']
              }
            }
          },
          required: ['title','fields'],
          propertyOrdering: ['title','description','fields']
        }
      }
    })

    const text = response.text
    let spec: any
    try {
      // Some SDK versions may wrap JSON with code fences; strip if present
      const trimmed = (text || '').trim()
      const cleaned = trimmed.startsWith('```')
        ? trimmed.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '')
        : trimmed
      spec = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Invalid AI response' }, { status: 502 })
    }

    const parsed = FormSpecSchema.safeParse(spec)
    if (!parsed.success) {
      return NextResponse.json({ error: 'AI output failed validation', issues: parsed.error.flatten() }, { status: 422 })
    }

    // Log generation for usage tracking
    await supabase.from('ai_generations').insert({ user_id: user.id, description })

    return NextResponse.json({ spec: parsed.data })
  } catch (err: any) {
    console.error('AI generate error', err)
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}


