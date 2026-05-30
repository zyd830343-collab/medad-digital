import { useState } from "react";

const C = {
  bg:"#0a0e1a", card:"#0f1629", border:"#1e3a6e",
  blue:"#2563eb", cyan:"#06b6d4", gold:"#f59e0b",
  white:"#f8fafc", gray:"#94a3b8",
};

function Field({ label, value, onChange, placeholder }) {
  const [f,setF] = useState(false);
  return (
    <div style={{marginBottom:16}}>
      <label style={{display:"block",marginBottom:6,fontSize:13,color:C.cyan,fontWeight:600}}>{label}</label>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{width:"100%",padding:"11px 14px",background:f?"rgba(37,99,235,.08)":"rgba(255,255,255,.03)",
          border:`1px solid ${f?C.blue:C.border}`,borderRadius:10,color:C.white,fontSize:13,outline:"none"}}/>
    </div>
  );
}

function Chips({ label, options, selected, onChange }) {
  const toggle = v => onChange(selected.includes(v)?selected.filter(x=>x!==v):[...selected,v]);
  return (
    <div style={{marginBottom:16}}>
      <label style={{display:"block",marginBottom:8,fontSize:13,color:C.cyan,fontWeight:600}}>{label}</label>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {options.map(o=>{
          const on=selected.includes(o);
          return <button key={o} onClick={()=>toggle(o)} style={{
            padding:"7px 14px",borderRadius:8,cursor:"pointer",fontSize:12,
            background:on?"rgba(37,99,235,.2)":"transparent",
            border:`1px solid ${on?C.blue:C.border}`,color:on?C.cyan:C.gray,
          }}>{o}</button>;
        })}
      </div>
    </div>
  );
}

function StepBar({step}) {
  const steps=["بياناتك","أهدافك","منافسيك"];
  return (
    <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:28}}>
      {steps.map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:11,fontWeight:700,
            background:i<step?C.blue:i===step?C.cyan:"transparent",
            border:`2px solid ${i<=step?C.cyan:C.border}`,
            color:i<=step?"#fff":C.gray}}>
            {i<step?"✓":i+1}
          </div>
          <span style={{fontSize:11,color:i===step?C.cyan:C.gray}}>{s}</span>
          {i<2&&<div style={{width:20,height:2,background:i<step?C.blue:C.border}}/>}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [step,setStep]=useState(0);
  const [loading,setLoading]=useState(false);
  const [report,setReport]=useState(null);
  const [error,setError]=useState("");
  const [d,setD]=useState({
    name:"",industry:"",location:"",audience:"",
    goals:[],channels:[],budget:"",challenge:"",
    c1:"",c2:"",c3:"",unique:"",
  });
  const s=k=>v=>setD(p=>({...p,[k]:v}));

  const generate=async()=>{
    setLoading(true);setError("");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{role:"user",content:`أنت محلل تسويق رقمي خبير. اكتب تقرير تدقيق رقمي احترافي بالعربية لهذه الشركة:

الاسم: ${d.name}
القطاع: ${d.industry}
الموقع: ${d.location||"غير محدد"}
الجمهور: ${d.audience||"غير محدد"}
الأهداف: ${d.goals.join("، ")}
القنوات: ${d.channels.join("، ")||"لا يوجد"}
الميزانية: ${d.budget||"غير محددة"}
التحدي: ${d.challenge||"غير محدد"}
المنافسون: ${[d.c1,d.c2,d.c3].filter(Boolean).join("، ")||"لم يُحدد"}
التميز: ${d.unique||"غير محدد"}

اكتب تقريراً يتضمن:
## 🔍 تشخيص الوضع الحالي
## 🎯 أبرز 3 فرص نمو فورية
## 🏆 كيف تتفوق على المنافسين
## 📋 خطة العمل (90 يوماً)
## ⚡ الخطوة الفورية خلال 48 ساعة

اكتب بشكل مباشر وعملي ومخصص لهذه الشركة.`}],
        }),
      });
      if(!res.ok)throw new Error();
      const data=await res.json();
      setReport(data.content?.map(c=>c.text||"").join("")||"");
    }catch{
      setError("حدث خطأ. حاول مرة أخرى.");
    }finally{
      setLoading(false);
    }
  };

  const step0=(
    <div>
      <Field label="اسم الشركة *" value={d.name} onChange={s("name")} placeholder="مثال: مطعم الأصيل"/>
      <Field label="القطاع *" value={d.industry} onChange={s("industry")} placeholder="مثال: مطاعم، تجارة إلكترونية"/>
      <Field label="الموقع الجغرافي" value={d.location} onChange={s("location")} placeholder="مثال: بغداد، العراق"/>
      <Field label="جمهورك المستهدف" value={d.audience} onChange={s("audience")} placeholder="مثال: شباب 18-35"/>
    </div>
  );

  const step1=(
    <div>
      <Chips label="أهدافك الرئيسية" options={["زيادة المبيعات","الوعي بالعلامة","زيادة المتابعين","جذب عملاء جدد","تحسين الموقع","أتمتة التسويق"]} selected={d.goals} onChange={s("goals")}/>
      <Chips label="قنواتك الحالية" options={["Instagram","TikTok","Facebook","Twitter/X","LinkedIn","YouTube","موقع إلكتروني","لا يوجد"]} selected={d.channels} onChange={s("channels")}/>
      <Field label="ميزانيتك الشهرية" value={d.budget} onChange={s("budget")} placeholder="مثال: 200$"/>
      <Field label="أكبر تحدٍ الآن" value={d.challenge} onChange={s("challenge")} placeholder="مثال: لا أعرف كيف أجذب عملاء"/>
    </div>
  );

  const step2=(
    <div>
      <Field label="المنافس الأول" value={d.c1} onChange={s("c1")} placeholder="اسم الشركة أو رابطها"/>
      <Field label="المنافس الثاني (اختياري)" value={d.c2} onChange={s("c2")} placeholder="اسم الشركة أو رابطها"/>
      <Field label="المنافس الثالث (اختياري)" value={d.c3} onChange={s("c3")} placeholder="اسم الشركة أو رابطها"/>
      <Field label="ما الذي يجعلك مختلفاً؟" value={d.unique} onChange={s("unique")} placeholder="مثال: خدمة 24/7 وتوصيل سريع"/>
    </div>
  );

  const canNext=()=>{
    if(step===0)return d.name&&d.industry;
    if(step===1)return d.goals.length>0;
    return true;
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,padding:"20px 16px 40px",direction:"rtl",fontFamily:"system-ui,sans-serif"}}>
      <div style={{maxWidth:580,margin:"0 auto"}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,
            background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,
            borderRadius:12,padding:"10px 20px"}}>
            <div style={{width:32,height:32,borderRadius:8,
              background:`linear-gradient(135deg,${C.blue},#1e3a8a)`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:16,fontWeight:800,color:"#fff"}}>م</div>
            <div>
              <div style={{fontWeight:800,fontSize:14,color:C.white}}>مداد ديجيتال</div>
              <div style={{fontSize:9,color:C.cyan,letterSpacing:2}}>MEDAD DIGITAL</div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"24px 20px",boxShadow:"0 24px 80px rgba(0,0,0,.5)"}}>

          {report ? (
            /* Report */
            <div>
              <div style={{background:`linear-gradient(135deg,#1a3a8f,${C.card})`,borderRadius:14,padding:20,marginBottom:20,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,color:C.cyan,letterSpacing:3,marginBottom:6}}>MEDAD DIGITAL — AI AUDIT</div>
                <div style={{fontSize:20,fontWeight:800,color:C.white,marginBottom:4}}>تقرير {d.name}</div>
                <div style={{fontSize:12,color:C.gray}}>{d.industry}</div>
              </div>
              <div style={{background:"#080c18",borderRadius:14,padding:20,marginBottom:20,border:`1px solid ${C.border}`,fontSize:13,color:"#cbd5e1",lineHeight:1.9,whiteSpace:"pre-wrap"}}>
                {report.split('\n').map((line,i)=>{
                  if(line.startsWith('## '))return<div key={i} style={{color:C.cyan,fontWeight:700,fontSize:15,margin:"18px 0 8px",borderBottom:`1px solid ${C.border}`,paddingBottom:6}}>{line.replace('## ','')}</div>;
                  if(line.startsWith('- '))return<div key={i} style={{display:"flex",gap:8,margin:"5px 0"}}><span style={{color:C.blue}}>▸</span><span>{line.replace('- ','')}</span></div>;
                  if(!line.trim())return<div key={i} style={{height:8}}/>;
                  return<div key={i} style={{margin:"3px 0"}}>{line}</div>;
                })}
              </div>
              <div style={{textAlign:"center",background:"rgba(37,99,235,.1)",border:`1px solid ${C.blue}`,borderRadius:14,padding:20}}>
                <div style={{fontSize:15,fontWeight:700,color:C.white,marginBottom:6}}>هل أنت مستعد لتحويل هذا التقرير إلى نتائج؟</div>
                <div style={{fontSize:12,color:C.gray,marginBottom:16}}>فريق مداد جاهز لتنفيذ الاستراتيجية معك</div>
                <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                  <a href="https://wa.me/" style={{padding:"10px 24px",borderRadius:10,background:`linear-gradient(135deg,${C.blue},#1e3a8a)`,color:"#fff",textDecoration:"none",fontSize:13,fontWeight:700}}>📞 تواصل معنا</a>
                  <button onClick={()=>{setReport(null);setStep(0);setD({name:"",industry:"",location:"",audience:"",goals:[],channels:[],budget:"",challenge:"",c1:"",c2:"",c3:"",unique:""});}} style={{padding:"10px 24px",borderRadius:10,background:"transparent",border:`1px solid ${C.border}`,color:C.gray,fontSize:13,cursor:"pointer"}}>🔄 تدقيق جديد</button>
                </div>
              </div>
            </div>
          ) : loading ? (
            /* Loading */
            <div style={{textAlign:"center",padding:"50px 20px"}}>
              <div style={{width:64,height:64,margin:"0 auto 20px",border:`3px solid ${C.border}`,borderTop:`3px solid ${C.cyan}`,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
              <div style={{fontSize:18,fontWeight:700,color:C.white,marginBottom:8}}>الذكاء الاصطناعي يعمل ✍️</div>
              <div style={{fontSize:12,color:C.gray}}>20-30 ثانية...</div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : (
            /* Form */
            <>
              <div style={{textAlign:"center",marginBottom:24}}>
                <div style={{display:"inline-block",padding:"4px 14px",background:"rgba(37,99,235,.15)",border:"1px solid rgba(37,99,235,.3)",borderRadius:20,fontSize:11,color:C.cyan,marginBottom:10}}>🤖 AI AUDIT — مجاني 100%</div>
                <div style={{fontSize:22,fontWeight:800,color:C.white,marginBottom:6}}>تدقيقك الرقمي المجاني</div>
                <div style={{fontSize:12,color:C.gray,lineHeight:1.7}}>3 خطوات بسيطة وسيبني الذكاء الاصطناعي تقريرك</div>
              </div>
              <StepBar step={step}/>
              {step===0&&step0}
              {step===1&&step1}
              {step===2&&step2}
              {error&&<div style={{color:"#f87171",fontSize:12,textAlign:"center",marginBottom:12}}>{error}</div>}
              <div style={{display:"flex",gap:10,marginTop:20}}>
                {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:12,borderRadius:10,background:"transparent",border:`1px solid ${C.border}`,color:C.gray,cursor:"pointer",fontSize:13}}>← رجوع</button>}
                {step<2
                  ?<button onClick={()=>canNext()&&setStep(s=>s+1)} disabled={!canNext()} style={{flex:2,padding:12,borderRadius:10,border:"none",cursor:canNext()?"pointer":"not-allowed",background:canNext()?`linear-gradient(135deg,${C.blue},#1e3a8a)`:C.border,color:canNext()?"#fff":C.gray,fontSize:14,fontWeight:700}}>التالي →</button>
                  :<button onClick={generate} style={{flex:2,padding:12,borderRadius:10,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.gold},#b45309)`,color:"#000",fontSize:14,fontWeight:800}}>🚀 ابدأ التحليل</button>
                }
              </div>
            </>
          )}
        </div>
        <div style={{textAlign:"center",color:C.border,fontSize:11,marginTop:16}}>مداد ديجيتال · خالية من الربا · شفافة 100%</div>
      </div>
    </div>
  );
        }
    
