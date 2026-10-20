// Original procedural composition: four slowly voiced chords, repeating 32-beat phrase.
// No third-party audio files, network media, engine randomness or stored-life access.
export class LifeAudio{
 constructor(onChange=()=>{}){this.onChange=onChange;this.context=null;this.timer=null;this.playing=false;this.volume=.22;this.muted=false;this.effects=false;this.next=0;this.step=0;this.nodes=new Set();this.wasPlaying=false;}
 async play(){try{if(!this.context)this.context=new (window.AudioContext||window.webkitAudioContext)();await this.context.resume();this.playing=true;this.next=this.context.currentTime+.06;this.step=0;this.schedule();this.timer??=setInterval(()=>this.schedule(),300);this.onChange();return true;}catch(error){this.playing=false;this.onChange(error);return false;}}
 note(midi,time,length,gain=.035){if(!this.context||this.muted)return;const ctx=this.context,osc=ctx.createOscillator(),env=ctx.createGain();osc.type='triangle';osc.frequency.value=440*2**((midi-69)/12);const level=gain*this.volume;env.gain.setValueAtTime(0,time);env.gain.linearRampToValueAtTime(level,time+.25);env.gain.exponentialRampToValueAtTime(Math.max(.00001,level*.5),time+length*.65);env.gain.linearRampToValueAtTime(0,time+length);osc.connect(env).connect(ctx.destination);osc.start(time);osc.stop(time+length+.02);this.nodes.add(osc);osc.onended=()=>{this.nodes.delete(osc);osc.disconnect();env.disconnect();};}
 schedule(){if(!this.playing||document.hidden)return;const chords=[[48,55,60,64],[45,52,57,60],[41,48,53,57],[43,50,55,59]],beat=1.25;while(this.next<this.context.currentTime+1.2){const chord=chords[Math.floor(this.step/8)%4];if(this.step%8===0)chord.slice(0,3).forEach(n=>this.note(n,this.next,7.5,.028));this.note(chord[2+(Math.floor(this.step/2)%2)],this.next,2.3,.022);this.next+=beat;this.step=(this.step+1)%32;}}
 pause(){this.playing=false;clearInterval(this.timer);this.timer=null;for(const node of this.nodes){try{node.stop();}catch{}}this.nodes.clear();this.context?.suspend().catch(()=>{});this.onChange();}
 setVolume(value){this.volume=Math.max(0,Math.min(1,Number(value)||0));if(this.playing){this.pause();this.play();}else this.onChange();}
 setMuted(value){this.muted=!!value;if(this.playing){this.pause();this.play();}else this.onChange();}
 background(hidden){if(hidden){this.wasPlaying=this.playing;if(this.playing)this.pause();}else if(this.wasPlaying){this.wasPlaying=false;this.onChange();} /* User explicitly resumes after returning. */}
 chime(){if(this.effects&&this.playing&&!document.hidden){this.note(72,this.context.currentTime+.02,.8,.025);this.note(76,this.context.currentTime+.16,.8,.02);}}
 destroy(){this.pause();this.context?.close().catch(()=>{});}
}
