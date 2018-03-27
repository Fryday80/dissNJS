/**
 * Created by Fry on 27.03.2018.
 */

window.DEV = true;
window.dev = "dev log:";

// window.log = function () {
//     switch (arguments.length){
//         case 0:
//             console.log(dev, "no arguments given");
//             break;
//         case 1:
//             console.log(dev, arguments[0]);
//             break;
//         case 2:
//             console.log(dev, arguments[0], arguments[1]);
//             break;
//         case 3:
//             console.log(dev, arguments[0], arguments[1], arguments[2]);
//             break;
//         default:
//             console.log(dev, arguments);
//             break;
//     }
// };
window.log = function(){
    let args = [];
    // args.push(dev);
    for(let i = 0; i< arguments.length; i++){
        args.push(arguments[i]);
    }
    args.push( position() );
    log.history = log.history || [];   // store logs to an array for reference
    log.history.push(args);
    if(this.console){
        // console.log.apply(console,args);
        console.log( Array.prototype.slice.call(args) );
    }
};
function position (){
    let errorString = Error().stack.split('\n')[2];
    return 'CALL @ ' + errorString.substring(errorString.lastIndexOf("(")+1,errorString.lastIndexOf(")"));
}
