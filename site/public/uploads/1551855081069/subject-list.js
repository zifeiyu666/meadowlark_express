// pages/subject-list/subject-list.js
Page({
  data: {
    list: [],
    start: 0,
    loading: false,
    type: ""
  },
  onLoad: function (options) {
    let { type } = options;
    this.setData({
      type
    })
    this.loadData(type);
    wx.setNavigationBarTitle({
      title: type
    })
  },
  tap(e) {
    console.log(e.currentTarget.dataset.id);
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id,
    })
  },
  lower() {
    console.log(111)
    if (!this.data.loading) {
      this.loadData( this.data.type );
    }
  },
  loadData(type) {
    let { start, list } = this.data;
    wx.showLoading({
      title: '正在拼命加载...',
      mask: true
    })
    this.setData({
      loading: true
    })
    wx.request({
      url: `https://www.koocv.com/h5-view/v/movie/list?tags=${type}&start=${this.data.start}`,
      success: (res) => {
        // console.log(res.data.data);
        start += 20;
        list.push(...res.data.data)
        this.setData({
          list,
          start,
          loading: false
        });
        wx.hideLoading();
      }
    })
  }
})