export const apply = (value, op) => ({'+1':value+1,'−1':value-1,'×2':value*2,'÷2':value/2})[op];
export const tolerance = n => 10 + Math.min(20, Math.floor(n/15));
export function chooseOperation(n, value, random = Math.random, mode='campaign') {
  const intro = mode==='demo' ? 8 : 30;
  if(n<intro) return '+1';
  const options=['+1','+1','−1'];
  if(n>=intro+5 && value>0 && value<=20) options.push('×2');
  if(n>=intro+10 && value>=2 && value%2===0) options.push('÷2');
  return options[Math.floor(random()*options.length)];
}
export const interval = (n, change) => Math.max(1.8, 3.3-n*.025, Math.abs(change)/5+1.1);
export const starsFor = greenRatio => greenRatio>=.97?3:greenRatio>=.8?2:1;
export function stepRage(rage, error, limit, dt, grace=false){
  if(grace) return Math.max(0,rage-dt*.08);
  return Math.max(0,Math.min(1,rage+dt*(error<=1?-.24:error<limit?(error-1)/(limit-1)*.13:.42)));
}
