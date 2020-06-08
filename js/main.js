function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } const _arr = []; let _n = true; let _d = false; let _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

const app = new Vue({
  el: '#app',
  data: {
    negara: 'Indonesia',
    sumber: 'Badan Nasional Penanggulangan Bencana',
    detail: {
      confirmed: 0,
      active: 0,
      recovered: 0,
      deaths: 0,
      lastUpdate: ''
    },
    world: {
      confirmed: 0,
      active: 0,
      recovered: 0,
      deaths: 0
    },
    listProvince: [
      {
        province:'',
        confirmed:0,
        deaths:0
      }
    ],
    listCountry: [{
      country: '',
      confirmed: 0,
      recovered: 0,
      deaths: 0
    }],
    dbListCountry: [],
    refCount: 0,
    isLoading: false
  },
  computed: {
    loadingPercentage() {
      let persen = Math.ceil(this.refCount/10 * 100)
      persen -= 100
      return Math.abs(persen)
    }
  },
  methods: {
    ambilDetail: function ambilDetail() {

      axios.get(`https://kawalcovid19.harippe.id/api/summary`).then((response)=>{
        this.detail.confirmed = response.data.confirmed.value.toLocaleString().replace(',','.')
        this.detail.active = response.data.activeCare.value.toLocaleString().replace(',','.')
        this.detail.recovered = response.data.recovered.value.toLocaleString().replace(',','.')
        this.detail.deaths = response.data.deaths.value.toLocaleString().replace(',','.')

        const d = new Date(response.data.metadata.lastUpdatedAt)
        const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false}) 
        const [{ value: mo },,{ value: da },,{ value: ye },,{value:hour},,{value:minute},,{value:second}] = dtf.formatToParts(d) 
        
        this.detail.lastUpdate = `${da} ${mo} ${ye} ${hour}:${minute}:${second}`
      }).catch((err)=>console.log(err))

    },
    getListProvince: function getListProvince(){
      axios.get(`https://services5.arcgis.com/VS6HdKS0VfIhv8Ct/arcgis/rest/services/COVID19_Indonesia_per_Provinsi/FeatureServer/0/query?f=json&where=(Provinsi%20%3C%3E%20%27Indonesia%27)%20AND%20(Kasus_Posi%20%3C%3E%200)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Kasus_Posi%20desc&outSR=102100&resultOffset=0&resultRecordCount=34&cacheHint=true`).then((response)=>{
        let arr = []
        for(let i = 0; i < response.data.features.length; i++){
          arr.push({
            province: response.data.features[i].attributes.Provinsi.toLocaleString().replace(',','.'),
            confirmed: response.data.features[i].attributes.Kasus_Posi.toLocaleString().replace(',','.'),
            recovered: response.data.features[i].attributes.Kasus_Semb.toLocaleString().replace(',','.'),
            deaths: response.data.features[i].attributes.Kasus_Meni.toLocaleString().replace(',','.')
          })
        }
        this.listProvince = arr
      }).catch((err)=>console.log(err))
    },
    worldCase: function worldCase() {
      const _this2 = this;

      const link = "https://api.covid19api.com/summary";
      axios.get(link).then(response => {
        _this2.world.confirmed = response.data.Global.TotalConfirmed.toLocaleString().replace(',','.');
        _this2.world.active = (response.data.Global.TotalConfirmed - 
          (response.data.Global.TotalRecovered + response.data.Global.TotalDeaths)).toLocaleString().replace(',','.');
        _this2.world.recovered = response.data.Global.TotalRecovered.toLocaleString().replace(',','.');
        _this2.world.deaths = response.data.Global.TotalDeaths.toLocaleString().replace(',','.');
      }).catch(err => {
        return console.log(err);
      });
    },
    getListCountry: function getListCountry() {

      const link = "https://api.covid19api.com/summary";
      axios.get(link).then(response => {
        let arr = [];
        for(let item of response.data.Countries){
          arr.push({
            country: item.Country,
            confirmed : item.TotalConfirmed,
            active : (item.TotalConfirmed - (item.TotalRecovered + item.TotalDeaths)),
            recovered : item.TotalRecovered,
            deaths : item.TotalDeaths
          })
        }
        arr = arr.sort((a,b) => b.confirmed - a.confirmed)

        arrFormated = arr.map(item => {
          return {
            country: item.country,
            confirmed : item.confirmed.toLocaleString().replace(',','.'),
            active : item.active.toLocaleString().replace(',','.'),
            recovered : item.recovered.toLocaleString().replace(',','.'),
            deaths : item.deaths.toLocaleString().replace(',','.')
          }
        })

        this.listCountry = arrFormated;
        this.dbListCountry = this.listCountry;

      }).catch(err => {
        return console.log(err);
      });
    },
    cari: function cari(event) {
      const val = event.target.value;
      this.sumber = 'Johns Hopkins CSSE'

      if (val == '') {
        this.negara = "🌎";
        this.detail.confirmed = this.world.confirmed;
        this.detail.active = this.world.active;
        this.detail.recovered = this.world.recovered;
        this.detail.deaths = this.world.deaths;
        this.listCountry = this.dbListCountry;
      }else {
        const newVal = val[0].toUpperCase() + val.slice(1, val.length);
        const valReg = new RegExp("^".concat(newVal, ".*"), "g");
        const arr = this.dbListCountry.filter(item => {
          return item.country.match(valReg);
        });
        this.listCountry = arr;

        if (arr.length === 1) {
          if(newVal == 'Indonesia'){
            alert("Ada perubahaan data. Data beralih sumber menjadi Johns Hopkins CSSE, refresh atau matikan hidupkan kembali app untuk mengembalikan sumber menjadi Badan Nasional Penanggulangan Bencana")
            this.negara = arr[0].country;
            // this.sumber = 'Badan Nasional Penanggulangan Bencana'
          }else{
            this.negara = arr[0].country;
            this.detail.confirmed = arr[0].confirmed;
            this.detail.active = arr[0].active;
            this.detail.recovered = arr[0].recovered;
            this.detail.deaths = arr[0].deaths;
          }
        }
      }
    },
    
    searchMenu: function searchMenu() {
      const navbar = document.querySelector('.navbar');
      navbar.classList.add('show');
    },
    closeSearchMenu: function closeSearchMenu() {
      const navbar = document.querySelector('.navbar');
      navbar.classList.remove('show');
    },
    menu: function menu() {
      const navigation = document.querySelector('.navigation');
      navigation.classList.add('show');
    },
    closeMenu: function closeMenu() {
      const navigation = document.querySelector('.navigation');
      navigation.classList.remove('show');
    },
    setLoading(isLoading) {
      if (isLoading) {
        this.refCount++;
        this.isLoading = true;
      } else if (this.refCount > 0) {
        this.refCount--;
        this.isLoading = (this.refCount > 0);
      }
    }
  },
  created: function created() {
    axios.interceptors.request.use((config) => {
      // trigger 'loading=true' event here
      this.setLoading(true);
      return config;
    }, (error) => {
      // trigger 'loading=false' event here
      this.setLoading(false);
      return Promise.reject(error);
    });
  
    axios.interceptors.response.use((response) => {
      // trigger 'loading=false' event here
      this.setLoading(false);
      return response;
    }, (error) => {
      // trigger 'loading=false' event here
      this.setLoading(false);
      return Promise.reject(error);
    });
    this.ambilDetail();
    this.getListProvince();
    this.worldCase();
    this.getListCountry();
  },
  updated: function updated(){    

    if(this.negara !== 'Indonesia'){
      document.querySelector('.daftar-provinsi').style.display = 'none'
    }else{
      document.querySelector('.daftar-provinsi').style.display = 'block'
    }

  }
});

const progress = document.querySelector('#progress')
const progressBar = document.querySelector('#progress-bar')
const items = document.querySelector('#items')

if(progressBar.style.width == '100%'){
  setTimeout(()=>{
    progress.style.display = 'none'
    items.style.display = 'flex'
  }, 1000)
}
