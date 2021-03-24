sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/m/MessageToast', "sap/ui/model/json/JSONModel"],
	function(Controller, MessageToast, JSONModel) {
	"use strict";

	var PageController = Controller.extend("opensap.myapp.controller.App", {
        
        solve: function(aStartBoard){
        	console.log("Starting Solver...");
        	var iRows = aStartBoard.length;
        	var iColumns = aStartBoard[0].length;
        	var aBoard = this._cloneBoard(aStartBoard);
        	this._blockRoadNBs(aBoard);
        	var oSolution = {"aBoard":[], "iScore":0}; // {aBoard, iScore}
        	var aListToSolve = this._getStartPositions(aBoard); // [{aBoard, iX, iY}]
        	
			
			
			console.log("Solving...");
			while(aListToSolve.length > 0){
				var oCurr = aListToSolve.shift();
				var iCurrScore = this.score(oCurr.aBoard);
				console.log(aListToSolve.length);
				
				//Is the score better?
				if(iCurrScore > oSolution.iScore){
					oSolution.aBoard = oCurr.aBoard;
					oSolution.iScore = iCurrScore;
					console.log("New best score: " + iCurrScore);
				}
				
				//Add left
				var iLeft = oCurr.iX-1;
				if(iLeft >= 0 && oCurr.aBoard[iLeft][oCurr.iY] === 0){
					aListToSolve.push(this._getNBBoard(oCurr.aBoard, iLeft, oCurr.iY));
				}
				
				//Add right
				var iRight = oCurr.iX+1;
				if(iRight < iRows && oCurr.aBoard[iRight][oCurr.iY] === 0){
					aListToSolve.push(this._getNBBoard(oCurr.aBoard, iRight, oCurr.iY));
				}
				
				//Add up
				var iUp = oCurr.iY-1;
				if(iUp > 0 && oCurr.aBoard[oCurr.iX][iUp] === 0){
					aListToSolve.push(this._getNBBoard(oCurr.aBoard, oCurr.iX, iUp));
				}
				
				//Add down
				var iDown = oCurr.iY+1;
				if(iDown < iColumns && oCurr.aBoard[oCurr.iX][iDown] === 0){
					aListToSolve.push(this._getNBBoard(oCurr.aBoard, oCurr.iX, iDown));
				}
			}
			
			console.log(oSolution);
        },
        
        /*Returns the score of a board
        */
        score: function(aBoard){
        	var iScore = 0;
    		for(var i = 0; i < aBoard.length; i++){
        		for(var j = 0; j < aBoard[i].length; j++){
        			if(aBoard[i][j] === 0){
        				iScore+=Math.pow(2, this._countNBs(aBoard, i, j, 2)+1);
        			}
        		}
    		}
    		return iScore;
        },
        
        _getNBBoard: function(aBoard, x, y){
        		var aClone = this._cloneBoard(aBoard);
        		aClone[x][y] = 2;
        		return {"aBoard":aClone, "iX":x, "iY":y};
        },
        
        _getStartPositions: function(aBoard){
        	var aStartPositions = [];
        	var aNewBoard;
        	for(var i = 0; i < aBoard.length; i++){
        		if(i === 0 || i === aBoard.length-1){
        			for(var j = 0; j < aBoard[i].length; j++){
        				if(aBoard[i][j] !== 1 && aBoard[i][j] !== -1){
	        				aNewBoard = this._cloneBoard(aBoard);
	        				aNewBoard[i][j] = 2;
	        				aStartPositions.push({"aBoard":aNewBoard, "iX":i, "iY":j});
        				}
        			}
        		}else{
        			if(aBoard[i][0] !== 1 && aBoard[i][0] !== -1){
	        			aNewBoard = this._cloneBoard(aBoard);
	        			aNewBoard[i][0] = 2;
	    				aStartPositions.push({"aBoard":aNewBoard, "iX":i, "iY":0});
        			}
        			if(aBoard[i][aBoard[i].length-1] !== 1 && aBoard[i][aBoard[i].length-1] !== -1){
	    				aNewBoard = this._cloneBoard(aBoard);
	        			aNewBoard[i][aBoard[i].length-1] = 2;
	    				aStartPositions.push({"aBoard":aNewBoard, "iX":i, "iY":aBoard[i].length-1});
        			}
        		}
        	}
        	return aStartPositions;
        },
        
        _blockRoadNBs: function(aBoard){
        	for(var i = 0; i < aBoard.length; i++){
        		for(var j = 0; j < aBoard[i].length; j++){
        			if(aBoard[i][j] === 1){
        				var iLeft = aBoard[i-1]?aBoard[i-1][j]:undefined;
        				var iRight = aBoard[i+1]?aBoard[i+1][j]:undefined;
        				var iUp = aBoard[i][j-1];
        				var iDown = aBoard[i][j+1];
        				
	        			if(iLeft !== undefined && iLeft !== 1){
	        				aBoard[i-1][j] = -1;
	        			}
	        			if(iRight !== undefined && iRight !== 1){
	        				aBoard[i+1][j] = -1;
	        			}
	        			if(iUp !== undefined && iUp !== 1){
	        				aBoard[i][j-1] = -1;
	        			}
	        			if(iDown !== undefined && iDown !== 1){
	        				aBoard[i][j+1] = -1;
	        			}
        			}
        		}
        	}
        },
        
        /*Doesn't count diagonals nor itself
        */
        _getNBs: function(aBoard, x, y){
        	return [aBoard[x-1]?aBoard[x-1][y]:undefined, aBoard[x+1]?aBoard[x+1][y]:undefined, aBoard[x][y-1], aBoard[x][y+1]];
        },
        
        _countNBs: function(aBoard, x, y, iVal){
        	var iCount = 0;
        	this._getNBs(aBoard, x, y).forEach(function(i){
        		if(i === iVal){
        			iCount++;
        		}	
        	});
        	return iCount;
        },
        
        _cloneBoard: function(aBoard){
        	var aClone = [];
        	for (var i = 0; i < aBoard.length; i++){
			    aClone[i] = aBoard[i].slice();
			}
			return aClone;
        }
	});

	return PageController;
});