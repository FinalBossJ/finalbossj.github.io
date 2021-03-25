sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/m/MessageToast', "sap/ui/model/json/JSONModel"],
	function(Controller, MessageToast, JSONModel) {
	"use strict";

	var PageController = Controller.extend("opensap.myapp.controller.App", {
        
        solve: function(aStartBoard){
        	//var t0=0, t1=0, t2=0;
        	//var tTotal=0, tPlace=0, tPop=0;
        	console.log("Starting Solver...");
        	this._iRows = aStartBoard.length;
        	this._iColumns = aStartBoard[0].length;
        	var aTypedBoard = this._typeArray(aStartBoard);
        	var aBoard = this._cloneBoard(aTypedBoard);
        	var oBoard = this._prepareBoard(aBoard); // {aBoard, iX, iY, iScore}
        	var oSolution = {"aBoard":[], "iScore":0}; // {aBoard, iScore}
        	var aListToSolve = this._getStartPositions(oBoard); // [{aBoard, iX, iY, iScore}]
        	
			// t0 = performance.now();
			console.log("Solving...");
			while(aListToSolve.length > 0){
				//t2 = performance.now();
				var oCurr = aListToSolve.pop();
				//tPop += performance.now()-t2;
				var iCurrScore = oCurr.iScore;
				
				//Is the score better?
				if(iCurrScore > oSolution.iScore){
					oSolution.aBoard = oCurr.aBoard;
					oSolution.iScore = iCurrScore;
					//console.log("New best score: " + iCurrScore);
				}
				
				//t1 = performance.now();
				//Add left
				var iLeft = oCurr.iX-1;
				if(iLeft >= 0 && this._isPlaceable(oCurr.aBoard[this._getTypedIndex(iLeft,oCurr.iY)])){
					aListToSolve.push(this.placeRiver(oCurr, iLeft, oCurr.iY));
				}
				
				//Add right
				var iRight = oCurr.iX+1;
				if(iRight < this._iRows && this._isPlaceable(oCurr.aBoard[this._getTypedIndex(iRight,oCurr.iY)])){
					aListToSolve.push(this.placeRiver(oCurr, iRight, oCurr.iY));
				}
				
				//Add up
				var iUp = oCurr.iY-1;
				if(iUp > 0 && this._isPlaceable(oCurr.aBoard[this._getTypedIndex(oCurr.iX,iUp)])){
					aListToSolve.push(this.placeRiver(oCurr, oCurr.iX, iUp));
				}
				
				//Add down
				var iDown = oCurr.iY+1;
				if(iDown < this._iColumns && this._isPlaceable(oCurr.aBoard[this._getTypedIndex(oCurr.iX,iDown)])){
					aListToSolve.push(this.placeRiver(oCurr, oCurr.iX, iDown));
				}
				//tPlace += performance.now()-t1;
			}
			
			console.log(oSolution);
			// tTotal = performance.now()-t0;
			// var pPlace = (100*tPlace/tTotal);
			// var pPop = (100*tPop/tTotal);
			// console.log("Time Total: "+ tTotal.toFixed(2) + "ms (100%)");
			// console.log("Time Placing: "+ tPlace.toFixed(2) + "ms ("+pPlace.toFixed(2)+"%)");
			// console.log("Time Popping: "+ tPop.toFixed(2) + "ms ("+pPop.toFixed(2)+"%)");
        },
        
        /* oBoard = {aBoard, iX, iY, iScore}
        */
        placeRiver: function(oBoard, iX, iY){
        	var aClone = this._cloneBoard(oBoard.aBoard);
        	var iNewScore = oBoard.iScore - aClone[this._getTypedIndex(iX,iY)];
        	aClone[this._getTypedIndex(iX,iY)] = 3;
        	if(iX-1 >= 0 && this._isPlaceable(aClone[this._getTypedIndex(iX-1,iY)])){
        		if(aClone[this._getTypedIndex(iX-1,iY)] === 2){
        			iNewScore += 2;
        			aClone[this._getTypedIndex(iX-1,iY)] = 4;
        		}else{
        			iNewScore += 4;
        			aClone[this._getTypedIndex(iX-1,iY)] += 4;
        		}     		       		
        	}
        	if(iY-1 >= 0 && this._isPlaceable(aClone[this._getTypedIndex(iX,iY-1)])){
        		if(aClone[this._getTypedIndex(iX,iY-1)] === 2){
        			iNewScore += 2;
        			aClone[this._getTypedIndex(iX,iY-1)] = 4;
        		}else{
        			iNewScore += 4;
        			aClone[this._getTypedIndex(iX,iY-1)] += 4;
        		}
        	}
        	if(iX+1 < this._iRows && this._isPlaceable(aClone[this._getTypedIndex(iX+1,iY)])){
        		if(aClone[this._getTypedIndex(iX+1,iY)] === 2){
        			iNewScore += 2;
        			aClone[this._getTypedIndex(iX+1,iY)] = 4;
        		}else{
        			iNewScore += 4;
        			aClone[this._getTypedIndex(iX+1,iY)] += 4;
        		}
        	}
        	if(iY+1 < this._iColumns && this._isPlaceable(aClone[this._getTypedIndex(iX,iY+1)])){
        		if(aClone[this._getTypedIndex(iX,iY+1)] === 2){
        			iNewScore += 2;
        			aClone[this._getTypedIndex(iX,iY+1)] = 4;
        		}else{
        			iNewScore += 4;
        			aClone[this._getTypedIndex(iX,iY+1)] += 4;
        		}
        	}
        	return {"aBoard":aClone, "iX":iX, "iY":iY, "iScore":iNewScore};
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
        
        _getStartPositions: function(oBoard){
        	var aStartPositions = [];
        	var aBoard = oBoard.aBoard;
        	for(var i = 0; i < this._iRows; i++){
        		if(i === 0 || i === this._iRows-1){
        			for(var j = 0; j < this._iColumns; j++){
        				if(aBoard[this._getTypedIndex(i,j)] !== 1 && aBoard[this._getTypedIndex(i,j)] !== -1){
	        				aStartPositions.push(this.placeRiver(oBoard, i, j));
        				}
        			}
        		}else{
        			if(aBoard[this._getTypedIndex(i,0)] !== 1 && aBoard[this._getTypedIndex(i,0)] !== -1){
	    				aStartPositions.push(this.placeRiver(oBoard, i, 0));
        			}
        			if(aBoard[this._getTypedIndex(i,this._iColumns-1)] !== 1 && aBoard[this._getTypedIndex(i,this._iColumns-1)] !== -1){
	    				aStartPositions.push(this.placeRiver(oBoard, i, this._iColumns-1));
        			}
        		}
        	}
        	return aStartPositions;
        },
        
        /* Blocks road sideways and fills empty cells with thickets
        */
        _prepareBoard: function(aBoard){
        	var oBoard = {"aBoard":aBoard, "iX":0, "iY": 0, "iScore":0};
        	for(var i = 0; i < this._iRows; i++){
        		for(var j = 0; j < this._iColumns; j++){
        			if(aBoard[this._getTypedIndex(i,j)] === 1){
        				var iLeft = i-1>=0?aBoard[this._getTypedIndex(i-1, j)]:undefined;
        				var iRight = i+1<this._iRows?aBoard[this._getTypedIndex(i+1,j)]:undefined;
        				var iUp = j-1>=0?aBoard[this._getTypedIndex(i,j-1)]:undefined ;
        				var iDown = j+1<this._iColumns?aBoard[this._getTypedIndex(i,j+1)]:undefined;
        				
	        			if(iLeft !== undefined && iLeft !== 1){
	        				aBoard[this._getTypedIndex(i-1,j)] = -1;
	        			}
	        			if(iRight !== undefined && iRight !== 1){
	        				aBoard[this._getTypedIndex(i+1,j)] = -1;
	        			}
	        			if(iUp !== undefined && iUp !== 1){
	        				aBoard[this._getTypedIndex(i,j-1)] = -1;
	        			}
	        			if(iDown !== undefined && iDown !== 1){
	        				aBoard[this._getTypedIndex(i,j+1)] = -1;
	        			}
        			}else if(aBoard[this._getTypedIndex(i,j)] === 0){
        				aBoard[this._getTypedIndex(i,j)] = 2;
        				oBoard.iScore += 2;
        			}
        		}
        	}
        	return oBoard;
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
        	return aBoard.splice(0);
        },
        
        _isPlaceable: function(n){
        	return  [0, 2, 4, 8, 12].includes(n);
        },
        
        _typeArray: function(aBoard){
        	var aTypedArray = [];
        	for(var i = 0; i < aBoard.length; i++){
        		for(var j = 0; j < aBoard[i].length; j++){
        			aTypedArray[this._getTypedIndex(i,j)] = aBoard[i][j];
        		}
        	}
        	
        	return aTypedArray;
        },
        
        _getTypedIndex: function(x, y){
        	return this._iColumns*x+y;
        }
	});

	return PageController;
});