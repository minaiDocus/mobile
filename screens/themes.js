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
    shape: { backgroundColor: '#E9E9E7' },
    left: {},
    middle: {
      shape: {},
      text: { fontWeight: 'bold', fontSize: 16 },
    },
    right: {},
  },

  container: { backgroundColor: 'rgba(41,41,41,0.4)' },

  head: {
    shape: { backgroundColor: 'rgba(48,48,48,0.8)', padding: 7 },
    text: { color: '#fff' },
  },

  primary_button: {
    shape: { borderRadius: 2, backgroundColor: '#4C5A65' },
    text: { color: '#FFF' },
  },

  secondary_button: {
    shape: { borderRadius: 2, backgroundColor: '#696969' },
    text: { color: '#FFF' },
  },

  box_button: {
    shape: { linearColors: ['#D1E949', '#C0D838', '#9DA505'] },
    marker: { fontSize: 12, fontWeight: 'bold', color: '#F7230C'},
    box_text: { backgroundColor: 'rgba(47,79,79, 0.6)', borderWidth: 1, borderTopWidth:0, borderColor: 'rgba(47,79,79, 1)' },
    text: { color: '#FFF', fontWeight: 'bold' }
  },

  box: {
    borderRadius:3,
    // elevation: 7, //Android Shadow
    shadowColor: '#000',                  //===
    shadowOffset: {width: 0, height: 2},  //=== iOs shadow    
    shadowOpacity: 0.8,                   //===
    shadowRadius: 2,                      //===
    backgroundColor: "rgba(241,241,241,0.6)",
    borderWidth: 2,
    borderColor: '#fff'
  },

  color_striped: {
    pair: 'rgba(200,200,200,0.5)',
    impair: 'rgba(255,255,255,0.5)',
  },

  lists:{
    shape: {
      borderRadius:3,
      // elevation: 7, //Android Shadow
      shadowColor: '#000',                  //===
      shadowOffset: {width: 0, height: 2},  //=== iOs shadow    
      shadowOpacity: 0.8,                   //===
      shadowRadius: 2,                      //===
      backgroundColor:"rgba(241,241,241,0.6)",
      borderWidth: 2,
      borderColor: '#fff',
      padding: 5,
      margin: 5
    },
    title: { textAlign:'center',fontSize:14, fontWeight:'bold' },
  },

  inputs:{
    shape: { borderWidth:1, borderRadius: 7, borderColor:'#909090', backgroundColor: 'rgba(224,224,224,0.6)' },
    text: { color: '#606060' },
    label: { color: '#3E2F24', fontSize: 10, paddingRight: 2 }
  },

  table:{
    head: {
      shape: { backgroundColor: '#3e2f24' },
      th_text: { textAlign: 'center', color: '#fff' },
      th_shape: { borderLeftWidth: 1, borderRightWidth: 1, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#999'}, //Don't use borderWidth style only
    },
    body:{
      td_text: {},
      td_shape: { padding: 5, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#999' },
      pair:{ backgroundColor: '#FFF' },
      impair: { backgroundColor: '#F2F2F2'}
    }
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
    head_container: { height:27, marginBottom: 5 },
    shape: { backgroundColor: "transparent", borderBottomWidth:1, borderColor: '#808080', marginHorizontal: 0 },
    title: { fontSize: 12, textAlign: 'center', fontWeight: 'bold', color: '#888' },
    icons: { width: 25, height: 25 },
    selected: { 
      shape: { backgroundColor:"rgba(0,0,0,0.3)", borderWidth: 0, borderBottomWidth: 1 },
      text: { textShadowColor:'#3E2F24', textShadowOffset:{width: 1, height: 1}, textShadowRadius:1, color: '#EEE', fontSize: 14 },
      icon: { width:40, height:40, },
    },
    body_container: { backgroundColor: 'transparent' }
  },

  menu:{
    bg: { //the background menu is a linear gradient with 3 color
          color_1 : '#FFF',
          color_2 : '#FFF',
          color_3 : '#FFF',
        },
    shape: { borderWidth: 1, borderColor: '#151515', borderTopRightRadius:3, borderBottomRightRadius:3 },
    head: {
      shape: { borderColor:'#151515', borderBottomWidth:1 },
      text_1: { fontSize: 12, color: '#2F4F4F', marginBottom: 10 },
      text_2: { fontSize: 12, color: '#3E2F24' },
    },
    body: {
      links: { fontSize: 14, color: '#3E2F24' },
    },
    footer: {
      links: { },
      shape: { borderColor:'#3E2F24', borderTopWidth:1 },
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