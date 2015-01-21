/**
 * author: www.eisneim.com
 * this file is modified version of videocopilot.net's "trim compose.jsx",
 * this script make multi clips into one compose and keep timeline position,
 * it's extremly useful when you have a audio sync animation project; 
 */
{
    function precompTrim()
    {	

        // get current working composition
        var curComp = app.project.activeItem;
        if (!(curComp instanceof CompItem))
        {
            alert("Please select a composition.");
            return;
        }
        // get all selected layers
        var layers = curComp.selectedLayers;
        if (layers.length == 0)
        {
            alert("Please select one or more layers.");
            return;
        }
        /*
            add to undo list
         */ 
        app.beginUndoGroup("Precomp and Trim Layers");
        // set folder name ( the folder that holds all created new comps )
        var compFolder = prompt("Comp Folder Name", "Trimmed Comps");
        // check if this folder already exist;
        var projItems = app.project.items , isExists = false;
        for (var i=1; i<=projItems.length; i++)
            if (projItems[i].typeName == "Folder" && projItems[i].name == compFolder)
            {
                compFolder = projItems[i];
                isExists = true;
                break;
            }

        if(!isExists){
            compFolder = app.project.items.addFolder(compFolder);    
        }

        var offset = parseInt(prompt("Add Handles (extra frames at beginning & ending for transition)", "0"));
        offset = offset * curComp.frameDuration;

            // get smallest inpoint and largest outpoint;
            var inPointArr = [], outPointArr = [];
            for (var i=0; i<layers.length; i++){
                inPointArr.push( layers[i].inPoint );
                outPointArr.push( layers[i].outPoint );
            };
            // now lets sort it;
            inPointArr.sort(function(a,b){
                return a-b;
            });
            outPointArr.sort(function(a,b){
                return b-a;
            });

            // now we get the in and out of the precomp we gonna create
            var inPoint = inPointArr[0]-offset, 
                outPoint = outPointArr[0]+offset;

			var compName = layers[0].name + " Precomp";
            var duration = outPoint - inPoint;
            
            // now modify each selected layer: shift it to the beginning of timeline;
            var firstInpoint = layers[0].inPoint - offset, layerIndices = [];
            for(var ii=0; ii< layers.length; ii++){
                layerIndices.push(layers[ii].index );// will be used when precomose()

                layers[ii].startTime -= firstInpoint;
            }
            
            //  precomp settings; this comp is in the current comp;
            var preCompItem = curComp.layers.precompose(layerIndices, compName, true);
            preCompItem.duration = duration;
            // which folder to hold this precomp
            preCompItem.parentFolder = compFolder;
            // trim workingArea
            preCompItem.workAreaStart = 0;
            preCompItem.workAreaDuration = preCompItem.duration;
            
            // all layers has been precomposed so this is new selected precomp
            var preComp = curComp.selectedLayers[0];
            preComp.startTime = inPoint;
            preComp.inPoint = inPoint;
            preComp.outPoint = outPoint;


        app.endUndoGroup();
    }

    precompTrim();
}