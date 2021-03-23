sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/m/MessageToast', "sap/ui/model/json/JSONModel"],
	function(Controller, MessageToast, JSONModel) {
	"use strict";

	var PageController = Controller.extend("opensap.myapp.controller.App", {
		onInit: function () {
			var self = this;
			var oView = this.getView();
			var oBoard = oView.byId("board");
			var oViewModel = new JSONModel({
				busy : true,
				BusyDelay : 0
			    });
		    oViewModel.setProperty("/DrawMode", 1); // 0 - Cell; 1 - Line; 2 - MultiLine
		    oView.setModel(oViewModel, "LHModel");
			
			this._bDrawing = false;
			this._bErasing = false;
			this._oDrawTile;
			this._oHoverTile;
			this._aHoverPreview = [];
			
			this._iRows = 12;
			this._iColumns = 21;
			this._aBoard = new Array(this._iRows); //0 - Empty; 1 - Road
			for(var i = 0; i < this._aBoard.length; i++){
				this._aBoard[i] = new Array(this._iColumns);
				for(var j = 0; j < this._aBoard[i].length; j++){
					this._aBoard[i][j] = 0;
				}
			}
			this._aTilesBoard = new Array(this._iRows);
			for(i = 0; i < this._aTilesBoard.length; i++){
				this._aTilesBoard[i] = new Array(this._iColumns);
			}
			
			jQuery.sap.includeStyleSheet('./css/style.css');
			
			var fnPress = function(oEvent){
				if(self._bDrawing){
					if(this === self._oDrawTile){
						if(self._bErasing){
							self._setEmpty(this);
						}else{
							self._setRoad(this);
						}	
						self._bDrawing = false;
						self._oDrawTile.removeStyleClass("boardTileSelected");
						self._oDrawTile = null;
					}else{
						var oLastTile = self._oDrawTile === self._aHoverPreview[0]?self._aHoverPreview[self._aHoverPreview.length-1]:
							self._aHoverPreview[0];
						self._oDrawTile.removeStyleClass("boardTileSelected");
						self._aHoverPreview.forEach(function(oItem){
							if(self._bErasing){
								self._setEmpty(oItem);
							}else{
								self._setRoad(oItem);
							}
						});
						if(self._getDrawMode() === 2){
							self._oDrawTile = oLastTile;
							self._oDrawTile.addStyleClass("boardTileSelected");
						}else{
							self._bDrawing = false;
							self._oDrawTile = null;
						}
					}
				}else{
					self._bDrawing = true;
					self._oDrawTile = this;
					self._oDrawTile.addStyleClass("boardTileSelected");
					self._oHoverTile = null;
					self._bErasing = self._isRoad(this);
					if(self._bErasing){
						self._oDrawTile.setProperty("backgroundImage", "images/RoadHoverErase.png");
					}
				}
				self._clearHoverPreview();
			};
			
			var fnHover = function(oEvent){
				if(this !== self._oHoverTile){
					var oPrevHoverTile = self._oHoverTile;
					self._oHoverTile = this;
					if(self._bDrawing){
						var x = self._getX(this);
						var y = self._getY(this);
						var iDrawX = self._getX(self._oDrawTile);
						var iDrawY = self._getY(self._oDrawTile);
						var bXGTY = Math.abs(x - iDrawX) >= Math.abs(y - iDrawY);
						var iMin, iMax;
						var oTempTile;
						self._clearHoverPreview();
						if(bXGTY){
							iMin = Math.min(x, iDrawX);
							iMax = Math.max(x, iDrawX);
						}else{
							iMin = Math.min(y, iDrawY);
							iMax = Math.max(y, iDrawY);
						}
						for(var k = iMin; k <= iMax; k++){
							oTempTile = bXGTY?self._aTilesBoard[k][iDrawY]:self._aTilesBoard[iDrawX][k];
							if(!self._aHoverPreview.includes(oTempTile)){
								self._aHoverPreview.push(oTempTile);
								if((self._isEmpty(oTempTile) && !self._bErasing)
									|| (self._isRoad(oTempTile) && self._bErasing)){
									var sImage;
									if(self._bErasing){
										sImage = "images/RoadHoverErase.png";
									}else{
										sImage = "images/RoadHover.png";
									}
									oTempTile.setProperty("backgroundImage", sImage);
								}
							}
						}
					}else{
						if(oPrevHoverTile){
							self._removeHover(oPrevHoverTile);
						}
						self._oHoverTile.setProperty("backgroundImage", "images/RoadHover.png");
					}
				}
			};
			
			for(i = 0; i < this._iRows; i++){
				var oRow = new sap.m.HBox("Row"+i);
				oRow.setFitContainer(true);
				oBoard.addItem(oRow);
				for(j = 0; j < this._iColumns; j++){
					var oTile = new sap.m.GenericTile("Tile-"+i+"-"+j);
					oTile.addStyleClass("boardTile");
					oTile.setProperty("backgroundImage", "images/Empty.png");
					oTile.attachPress(fnPress);
					oTile.attachBrowserEvent("mouseenter", fnHover );
					self._aTilesBoard[i][j] = oTile;
					oRow.addItem(oTile);
				}
			}       
			
            this.sTurn = "Red";
            this.sWinner = "";
            this.sGrid = ["", "", "", "", "", "", "", "", ""];
            var oViewModel = new JSONModel({sTurn: this.sTurn, sWinner: this.sWinner});
            this.getView().setModel(oViewModel,"view");
        },
		
		press : function(evt) {
			var oTile = evt.getSource();
			if(oTile.getProperty("backgroundImage") === "" && this.sWinner === ""){
				if(this.sTurn === "Red"){
					oTile.setProperty("backgroundImage", "images/Red");
					this.sTurn = "Blue";
				}else{
					oTile.setProperty("backgroundImage", "images/Blue");
					this.sTurn = "Red";
				}
				this._checkVictory();
				var oViewModel = new JSONModel({sTurn: this.sTurn, sWinner: this.sWinner});
            	this.getView().setModel(oViewModel,"view");				//Maneira mais eficiente de atualizar a view??
			}

			//MessageToast.show("The GenericTile is pressed.");
		},
		
		_getX: function(oTile){
			return oTile.getId().split('-')[1];
		},
		
		_getY: function(oTile){
			return oTile.getId().split('-')[2];
		},
		
		_removeHover: function(oTile){
			if(this._isEmpty(oTile)){
				oTile.setProperty("backgroundImage", "images/Empty.png");
			}else{
				oTile.setProperty("backgroundImage", "images/Road.png");
			}
		},
		
		_clearHoverPreview: function(){
			var self = this;
			var oTempHoverPreview = this._aHoverPreview.slice();
			this._aHoverPreview.forEach(function(oItem){
				self._removeHover(oItem);
				oTempHoverPreview.pop(oItem);
				oTempHoverPreview = oTempHoverPreview.filter(function(value){ 
			        return value !== oItem;
			    });
			});
			this._aHoverPreview = oTempHoverPreview;
		},
		
		_setRoad: function(oTile){
			var x = this._getX(oTile);
			var y = this._getY(oTile);
			this._aBoard[x][y] = 1;
			oTile.setProperty("backgroundImage", "images/Road.png");
			
		},
		
		_setEmpty: function(oTile){
			var x = this._getX(oTile);
			var y = this._getY(oTile);
			this._aBoard[x][y] = 0;
			oTile.setProperty("backgroundImage", "images/Empty.png");
			
		},
		
		_isRoad: function(oTile){
			var x = this._getX(oTile);
			var y = this._getY(oTile);
			return this._aBoard[x][y] === 1;
		},
		
		_isEmpty: function(oTile){
			var x = this._getX(oTile);
			var y = this._getY(oTile);
			return this._aBoard[x][y] === 0;
		},
		
		_getDrawMode: function(){
			return this.getView().getModel("LHModel").getProperty("/DrawMode");
		},
		
		_checkVictory: function(){
			for(var i = 1; i < 10; i++){
				var oTile = this.getView().byId("tile" + i);
				var sTemp = oTile.getBackgroundImage().split("/");	
				this.sGrid[i-1] = sTemp[sTemp.length-1];
			}
			//Horizontal checks
			if(this.sGrid[0] !== "" && this.sGrid[0] === this.sGrid[1] && this.sGrid[0] === this.sGrid[2])
				this.sWinner = this.sGrid[0];
			else if(this.sGrid[3] !== "" && this.sGrid[3] === this.sGrid[4] && this.sGrid[3] === this.sGrid[5])
				this.sWinner = this.sGrid[3];
			else if(this.sGrid[6] !== "" && this.sGrid[6] === this.sGrid[7] && this.sGrid[6] === this.sGrid[8])
				this.sWinner = this.sGrid[7];
			//Vertical checks
			else if(this.sGrid[0] !== "" && this.sGrid[0] === this.sGrid[3] && this.sGrid[0] === this.sGrid[6])
				this.sWinner = this.sGrid[0];
			else if(this.sGrid[1] !== "" && this.sGrid[1] === this.sGrid[4] && this.sGrid[1] === this.sGrid[7])
				this.sWinner = this.sGrid[1];	
			else if(this.sGrid[2] !== "" && this.sGrid[2] === this.sGrid[5] && this.sGrid[2] === this.sGrid[8])
				this.sWinner = this.sGrid[2];
			//Diagonal checks
			else if(this.sGrid[0] !== "" && this.sGrid[0] === this.sGrid[4] && this.sGrid[0] === this.sGrid[8])
				this.sWinner = this.sGrid[0];
			else if(this.sGrid[2] !== "" && this.sGrid[2] === this.sGrid[4] && this.sGrid[2] === this.sGrid[6])
				this.sWinner = this.sGrid[2];
			if(this.sWinner !== ""){
				MessageToast.show(this.sWinner + " wins!");
				this.sTurn = this.sWinner;
			}
			
		},
		
		onPress: function (evt) {
			for(var i = 1; i < 10; i++){
				var oTile = this.getView().byId("tile" + i);
					oTile.setProperty("backgroundImage", "");
				this.sGrid[i-1] = "";
				this.sWinner = "";
			}
		}
	});

	return PageController;
});