//Default theme
global.ThemeLists = []

ThemeLists.push( { code: 'def', name: 'Défault', style: {
  textBold: { fontWeight: 'bold' },
  textItalic: { fontStyle: 'italic' },

  body: { backgroundColor: '#FFF' },

  global_text: { 
    fontFamily: Config.platform == 'ios' ? 'arial' : 'lucida grande',
    color: '#3E2F24',
    fontSize: 12,
  },

  header: {
    shape: {},
    left: {},
    middle: {
      shape: {},
      text: { fontWeight: 'bold', fontSize: 16 },
    },
    right: {},
  },

  container: { backgroundColor: 'rgba(41,41,41,0.4)' },

  head: {
    shape: { backgroundColor: '#585858', padding: 3 },
    text: {},
  },

  primary_button: {
    shape: { borderRadius: 2, backgroundColor: '#007bff' },
    text: { color: '#FFF' },
  },

  secondary_button: {
    shape: { borderWidth: 1, backgroundColor: '#17a2b8', borderColor:'#FFF', borderRadius: 200, height: 63, width: 63 },
    text: { color: '#FFF' },
  },

  box_button: {
    shape: { linearColors: ['#D1E949', '#C0D838', '#9DA505'] },
    marker: { fontSize: 12, fontWeight: 'bold', color: '#F7230C'},
    box_text: { backgroundColor:'#AEAEAE' },
    text: { color: '#FFF', fontWeight: 'bold' }
  },

  box: {
    borderRadius:3,
    elevation: 7, //Android Shadow
    shadowColor: '#000',                  //===
    shadowOffset: {width: 0, height: 2},  //=== iOs shadow    
    shadowOpacity: 0.8,                   //===
    shadowRadius: 2,                      //===
    backgroundColor:"#E9E9E7",
    borderWidth: 1,
    borderColor: '#fff'
  },

  color_striped: {
    pair: '#F2F2F2',
    impair: '#FFF',
  },

  modal: {
    shape: { backgroundColor:"#FFF", borderWidth: 1, borderColor: '#fff', borderRadius:3 },
    title: { color: '#000', fontSize: 16, textAlign: 'left' },
    separator: { color: '#000', fontSize: 14 },
    label: {},
    head: { backgroundColor:'#D0D0D0' },
    foot: { backgroundColor:'#D0D0D0' },
  },

  tabs:{
    container: { height:30, borderColor:'#FFF', borderBottomWidth:1 },
    shape: { backgroundColor:"#AEAEAE", borderWidth:1, borderColor: '#DDD', borderTopLeftRadius:5, borderTopRightRadius:5, marginHorizontal: 0 },
    title: { fontSize: 14, textAlign: 'center', fontWeight: 'bold', color: '#DDD' },
    icons: { width: 25, height: 25 },
    selected: { 
      shape: { backgroundColor:"#F1F1F1", borderWidth:1, borderColor: '#FFF' },
      text: { color: '#3E2F24' },
    },
  },

  menu:{
    bg: { //the background menu is a linear gradient with 3 color
          color_1 : '#D0D0D0',
          color_2 : '#D0D0D0',
          color_3 : '#D0D0D0',
        },
    shape: { borderWidth: 1, borderColor: '#151515', borderTopRightRadius:5, borderBottomRightRadius:5 },
    head: {
      shape: { borderColor:'#151515', borderBottomWidth:2 },
      text_1: { fontSize: 14, color: '#000' },
      text_2: { fontSize: 12, color: '#fff' },
    },
    body: {
      links: { fontSize: 14 },
    },
    footer: {
      links: { },
      shape: { borderColor:'#151515', borderTopWidth:2 },
    }
  },

  graph:{
    graduation: {
      shape: { backgroundColor: 'rgba(0,0,0, 0.5)' },
      text: { color: '#fff' },
    },
    grid:{
      title: { fontWeight: 'bold', fontSize: 18 },
      content: { backgroundColor: 'rgba(255,255,255,0.3)', borderColor:'#999', borderBottomWidth: 1 },
      shape: { backgroundColor: '#FFF', borderColor:'#999', borderBottomWidth: 1 },
      text: {},
    },
    bar: { 
      shape: { backgroundColor: '#17a2b8' },
      text: { color: '#fff' }
    },
  },
}} )
//End default


//There is only one theme from now
global.GetTheme = (code) => {
  let th = null
  if(code == 'rand')
  {
    const rand = Math.floor(Math.random() * Math.floor(ThemeLists.length))
    th = ThemeLists[rand]
  }
  else
  {
    th = ThemeLists.find((t)=>{ return t.code == code })
  }

  if(th && th.style)
    return th.style
  else
    return ThemeLists.find((t)=>{ return t.code == 'def' }).style
}

global.Theme = GetTheme('def')