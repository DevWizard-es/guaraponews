import { saveSubscriber } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!name || !email || !email.includes('@')) {
      return NextResponse.json({ error: 'Nombre y email válidos requeridos' }, { status: 400 });
    }

    saveSubscriber(name, email);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message.includes('UNIQUE')) {
       return NextResponse.json({ error: 'Este email ya está suscrito' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
