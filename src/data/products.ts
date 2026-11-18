import type { Product } from '../types/index.ts'

const IMG = 'https://iupicanecas.com.br/uploads/produtos/imagem_principal_'

export const initialProducts: Product[] = [
  { id: '58', name: 'Caneca Street Fighter RYU', description: '', category: 'gamer', price: 36.9, priceFrom: true, active: true, image: `${IMG}20260928_202024_3d4e9ddf.png` },
  { id: '61', name: 'Caneca Street Fighter KEN', description: '', category: 'gamer', price: 36.9, priceFrom: true, active: true, image: `${IMG}20260928_205415_fdd6319f.png` },
  { id: '59', name: 'Caneca Street Fighter CHUN LI', description: '', category: 'gamer', price: 36.9, priceFrom: true, active: true, image: `${IMG}20260928_203047_5e3d3041.png` },
  { id: '60', name: 'Caneca Street Fighter GUILE', description: '', category: 'gamer', price: 36.9, priceFrom: true, active: true, image: `${IMG}20260928_204451_ac0f8ccd.png` },
  { id: '57', name: 'Caneca Battlefield 6', description: '', category: 'gamer', price: 36.9, priceFrom: true, active: true, image: `${IMG}20260928_121507_06b95feb.png` },
  { id: '56', name: 'Caneca Arc Riders', description: '', category: 'gamer', price: 36.9, priceFrom: true, active: true, image: `${IMG}20260928_120611_28ab04a3.png` },
  { id: '54', name: 'Caneca God Of War', description: '', category: 'gamer', price: 36.9, priceFrom: true, active: true, image: `${IMG}20260928_114725_de46ee8d.png` },
  { id: '53', name: 'Caneca The Last of Us', description: '', category: 'gamer', price: 36.9, priceFrom: true, active: true, image: `${IMG}20260928_113043_b0c3620f.png` },
  { id: '52', name: 'Caneca Gears of War', description: '', category: 'gamer', price: 36.9, priceFrom: true, active: true, image: `${IMG}20260927_194516_7e72edc9.png` },
  { id: '51', name: 'Caneca Aloy Horinzon', description: '', category: 'gamer', price: 36.9, priceFrom: true, active: true, image: `${IMG}20260927_193018_85f4350a.png` },
  { id: '50', name: 'Caneca Arthur Morgan', description: '', category: 'gamer', price: 36.9, priceFrom: true, active: true, image: `${IMG}20260927_192038_d9147dc4.png` },
  { id: '62', name: 'Caneca Metal Gear Solid', description: '', category: 'gamer', price: 36.9, priceFrom: true, active: true, image: `${IMG}20260928_212214_d8f31187.png` },
  { id: '63', name: 'Caneca DragonBall Z', description: '', category: 'geek-nerd', price: 56.9, active: true, image: `${IMG}20260929_110907_fb23a261.png` },
  { id: '4', name: 'Caneca Game Over', description: '', category: 'gamer', price: 42.9, active: true, image: `${IMG}20260608_230759_0a595eac.png` },
  { id: '3', name: 'Caneca Born to Play', description: '', category: 'gamer', price: 42.9, active: true, image: `${IMG}20260608_225430_77edeae0.png` },
  { id: '2', name: 'Caneca GameBoy', description: '', category: 'gamer', price: 42.9, active: true, image: `${IMG}20260608_223844_5e1ed6c4.png` },
]
