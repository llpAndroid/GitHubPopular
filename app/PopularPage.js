/**
 * PopularPage
 * @flow
 */
'use strict';
var React = require('react')
var ReactNative = require('react-native')
var {
  ActivityIndicator,
  ListView,
  Platform,
  StyleSheet,
  RefreshControl,
  Text,
  Alert,
  View,
} = ReactNative;
var RepositoryCell=require('./RepositoryCell')
var dismissKeyboard=require('dismissKeyboard')
var RepositoryDetail=require('./RepositoryDetail')
var FavoriteDao=require('./FavoriteDao')
var API_URL ='https://api.github.com/search/repositories?q='
var QUERY_STR='&sort=stars'
// var API_URL ='https://api.github.com/search/repositories?q=ios&sort=stars';
// var API_URL ='https://api.github.com/search/repositories?q=stars:>1&sort=stars';
var resultData=[];
var navigatorFrom;
var favoriteDao = new FavoriteDao();
var PopularPage=React.createClass({
  getInitialState: function(){
    return{
      isLoading:false,
      isLodingFail:false,
      dataSource:new ListView.DataSource({
        rowHasChanged:(row1,row2)=>row1!==row2,
      }),
      filter:'',
    };
  },
  componentDidMount:function(){
    this.loadData();
  },
  genFetchUrl(category:string){
    return API_URL+(category==='ALL'? 'stars:>1':category)+QUERY_STR;
  },
  loadData:function(){
    this.setState({
      isLoading:true,
      isLodingFail:false,
    });
    fetch(this.genFetchUrl(this.props.tabLabel))
    .then((response)=>
    response.json())
    .catch((error)=>{
      this.setState({
        isLoading:false,
        isLodingFail:true,
      });
    }).then((responseData)=>{
      resultData=responseData.items;
      this.setState({
        isLoading:false,
        isLodingFail:false,
        dataSource:this.getDataSource(responseData.items),
      });
    })
    .done();
  },
  onRefresh :function() {
    this.loadData();
  },
  getDataSource:function(items:Array<any>):ListView.DataSource{
    return this.state.dataSource.cloneWithRows(items);
  },
  onSelectRepository:function(item:Object) {
    this.onShowMessage(item.full_name);
    var belongNavigator=this.props.homeComponent.refs.navPopular;
    if (Platform.OS==='ios') {
      belongNavigator.push({
        title:item.full_name,
        component:RepositoryDetail,
        params:{
          item:item,
        },
      });
    }else {
      dismissKeyboard();
      belongNavigator.push({
        title:item.full_name,
        name:'item',
        item:item,
      });
    }
  },
  onShowMessage(alertMessage:string){
    Alert.alert(
                'Alert Title',
                alertMessage,
                [
                  {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
                  {text: 'OK', onPress: () => console.log('OK Pressed!')},
                ]
              )
  },
  onFavorite(item:Object,isFavorite:boolean){
    this.onShowMessage(item.full_name+':'+isFavorite);
    favoriteDao.saveFavoriteItem(item.id.toString(),JSON.stringify(item));
    favoriteDao.getAllItems().then((items)=>{
      console.log(items);
    }).catch((error)=>{
      console.log(error);
    });
  },
  renderRow:function(
    item:Object,
    sectionID:number|string,
    rowID:number|string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ){
    return(
      <RepositoryCell
        key={item.id}
        onSelect={()=>this.onSelectRepository(item)}
        item={item}
        isFavorite={false}
        onFavorite={this.onFavorite}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}/>
    );
  },
  renderSeparator: function(
    sectionID: number | string,
    rowID: number | string,
    adjacentRowHighlighted: boolean
  ) {
    var style = styles.rowSeparator;
    if (adjacentRowHighlighted) {
        style = [style, styles.rowSeparatorHide];
    }
    return (
      <View key={'SEP_' + sectionID + '_' + rowID}  style={style}/>
    );
  },

  render() {
    var content=
    <ListView
      ref="listView"
      style={styles.listView}
      renderRow={this.renderRow}
      //renderSeparator={this.renderSeparator}
      dataSource={this.state.dataSource}
      refreshControl={
         <RefreshControl
          //contentInset={50}
           refreshing={this.state.isLoading}
           onRefresh={()=>this.onRefresh()}
           tintColor="#ff0000"
            title="Loading..."
            titleColor="#00ff00"
            colors={['#ff0000', '#00ff00', '#0000ff']}
            progressBackgroundColor="#ffff00"
         />}
      />;
    return (
      // <DrawerLayout
      //   ref="drawer"
      //   drawerWidth={260}
      //   drawerPosition={DrawerLayout.positions.Left}
      //   renderNavigationView={() => <SettingPage />}
      //   >
        <View style={styles.container} >
          {content}
        </View>
      // </DrawerLayout>
    );
  },



});
var styles = StyleSheet.create({
  container: {
    flex:1,
    alignItems: 'stretch',
    backgroundColor: '#f0f8ff',
    // backgroundColor:'red'
  },
  listView:{
    // marginTop:-20,
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  rowSeparator: {
    // backgroundColor:'red',
    // height: 5,
    // marginLeft: 4,
  },
});
module.exports=PopularPage;
